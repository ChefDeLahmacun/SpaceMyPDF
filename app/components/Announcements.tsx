'use client';

import React, { useState, useEffect } from 'react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  published_at: string;
  expires_at?: string;
  is_active: boolean;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAnnouncements();
    loadDismissedAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/announcements/list');
      
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements);
      } else {
        throw new Error('Failed to fetch announcements');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setError(error instanceof Error ? error.message : 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const loadDismissedAnnouncements = () => {
    const dismissed = localStorage.getItem('dismissedAnnouncements');
    if (dismissed) {
      try {
        setDismissedAnnouncements(new Set(JSON.parse(dismissed)));
      } catch (error) {
        console.error('Error loading dismissed announcements:', error);
      }
    }
  };

  const dismissAnnouncement = (announcementId: string) => {
    const newDismissed = new Set(dismissedAnnouncements);
    newDismissed.add(announcementId);
    setDismissedAnnouncements(newDismissed);
    
    // Save to localStorage
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(Array.from(newDismissed)));
  };

  const getAnnouncementType = (title: string, content: string) => {
    const text = (title + ' ' + content).toLowerCase();
    if (text.includes('new feature') || text.includes('update') || text.includes('improvement')) {
      return { type: 'feature', icon: '🚀', color: 'blue' };
    }
    if (text.includes('maintenance') || text.includes('downtime') || text.includes('scheduled')) {
      return { type: 'maintenance', icon: '🔧', color: 'yellow' };
    }
    if (text.includes('important') || text.includes('urgent') || text.includes('critical')) {
      return { type: 'important', icon: '⚠️', color: 'red' };
    }
    if (text.includes('bonus') || text.includes('reward') || text.includes('earn')) {
      return { type: 'bonus', icon: '🎉', color: 'green' };
    }
    return { type: 'general', icon: '📢', color: 'gray' };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={fetchAnnouncements}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const visibleAnnouncements = announcements.filter(
    announcement => !dismissedAnnouncements.has(announcement.id)
  );

  if (visibleAnnouncements.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📢 Announcements
        </h3>
        <div className="text-center text-gray-500 py-8">
          <p>No new announcements at the moment.</p>
          <p className="text-sm mt-2">Check back later for updates and news!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {visibleAnnouncements.map((announcement) => {
        const announcementType = getAnnouncementType(announcement.title, announcement.content);
        const colorClasses = {
          blue: 'border-blue-200 bg-blue-50',
          yellow: 'border-yellow-200 bg-yellow-50',
          red: 'border-red-200 bg-red-50',
          green: 'border-green-200 bg-green-50',
          gray: 'border-gray-200 bg-gray-50'
        };

        return (
          <div
            key={announcement.id}
            className={`bg-white rounded-lg shadow-md p-6 border ${colorClasses[announcementType.color as keyof typeof colorClasses]}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{announcementType.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {announcement.title}
                  </h3>
                </div>
                
                <div 
                  className="text-gray-700 mb-4 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: announcement.content }}
                />
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    Published: {new Date(announcement.published_at).toLocaleDateString()}
                  </span>
                  {announcement.expires_at && (
                    <span>
                      Expires: {new Date(announcement.expires_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => dismissAnnouncement(announcement.id)}
                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                title="Dismiss announcement"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}