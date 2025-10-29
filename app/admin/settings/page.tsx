'use client';

import React, { useState, useEffect } from 'react';
import UserStatus from '@/app/components/UserStatus';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalSupportTickets: number;
  pendingFeatureRequests: number;
  databaseSize: string;
  lastBackup: string;
}

export default function AdminSettings() {
  const [user, setUser] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    expires_at: ''
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        await fetchData();
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Auth check error:', error);
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch announcements
      const announcementsResponse = await fetch('/api/admin/announcements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (announcementsResponse.ok) {
        const announcementsData = await announcementsResponse.json();
        setAnnouncements(announcementsData.announcements);
      }

      // Fetch system stats
      const statsResponse = await fetch('/api/admin/system-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setSystemStats(statsData.stats);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load settings data');
    }
  };

  const createAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAnnouncement)
      });

      if (response.ok) {
        await fetchData();
        setNewAnnouncement({ title: '', content: '', type: 'info', expires_at: '' });
        setShowAnnouncementForm(false);
      } else {
        alert('Failed to create announcement');
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Failed to create announcement');
    }
  };

  const toggleAnnouncement = async (id: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/announcements', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id,
          is_active: !isActive
        })
      });

      if (response.ok) {
        await fetchData();
      } else {
        alert('Failed to update announcement');
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
      alert('Failed to update announcement');
    }
  };

  const editAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setNewAnnouncement({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      expires_at: announcement.expires_at || ''
    });
    setShowAnnouncementForm(true);
  };

  const saveEditedAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/announcements', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: editingAnnouncement.id,
          title: newAnnouncement.title,
          content: newAnnouncement.content,
          type: newAnnouncement.type,
          expires_at: newAnnouncement.expires_at || null
        })
      });

      if (response.ok) {
        await fetchData();
        setNewAnnouncement({ title: '', content: '', type: 'info', expires_at: '' });
        setEditingAnnouncement(null);
        setShowAnnouncementForm(false);
      } else {
        alert('Failed to update announcement');
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
      alert('Failed to update announcement');
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/announcements?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchData();
      } else {
        alert('Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Failed to delete announcement');
    }
  };

  const closeAnnouncementForm = () => {
    setShowAnnouncementForm(false);
    setEditingAnnouncement(null);
    setNewAnnouncement({ title: '', content: '', type: 'info', expires_at: '' });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'info':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Info</span>;
      case 'warning':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Warning</span>;
      case 'success':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Success</span>;
      case 'error':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Error</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{type}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.href = '/admin'}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <a href="/admin" className="text-blue-600 hover:text-blue-800 mr-4">
                ← Back to Admin
              </a>
              <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                <div className="font-medium">{user?.name || user?.email}</div>
                <div className="text-xs text-gray-500">Admin</div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Overview */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats?.totalUsers || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats?.activeUsers || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Support Tickets</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats?.totalSupportTickets || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Feature Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats?.pendingFeatureRequests || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Database Size</p>
                  <p className="text-lg font-bold text-gray-900">{systemStats?.databaseSize || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Backup</p>
                  <p className="text-lg font-bold text-gray-900">{systemStats?.lastBackup || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Technical Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-3">Application Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Environment:</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    {process.env.NODE_ENV || 'development'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Version:</span>
                  <span className="text-sm text-gray-900">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Framework:</span>
                  <span className="text-sm text-gray-900">Next.js 14</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Database:</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    PostgreSQL
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-3">Services</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Email Service:</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    Gmail SMTP
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment:</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    Stripe
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Analytics:</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    Google Analytics
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hosting:</span>
                  <span className="text-sm text-gray-900">Vercel</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Site Announcements */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Site Announcements</h2>
            <button
              onClick={() => setShowAnnouncementForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Announcement
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Announcements appear at the top of your website to inform users about important updates, maintenance, or new features.
          </p>

          {announcements.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13a3 3 0 100-6" />
              </svg>
              <p className="text-gray-500">No announcements created yet.</p>
              <p className="text-sm text-gray-400 mt-1">Create your first announcement to communicate with users.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                      {getTypeBadge(announcement.type)}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        announcement.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {announcement.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editAnnouncement(announcement)}
                        className="px-3 py-1 text-xs rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200"
                        title="Edit announcement"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleAnnouncement(announcement.id, announcement.is_active)}
                        className={`px-3 py-1 text-xs rounded-md ${
                          announcement.is_active
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                        title={announcement.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {announcement.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deleteAnnouncement(announcement.id)}
                        className="px-3 py-1 text-xs rounded-md bg-red-100 text-red-800 hover:bg-red-200"
                        title="Delete announcement"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div 
                    className="text-sm text-gray-700 mb-2 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: announcement.content }}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Created: {new Date(announcement.created_at).toLocaleString()}</span>
                    {announcement.expires_at && (
                      <span>Expires: {new Date(announcement.expires_at).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Announcement Modal */}
      {showAnnouncementForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
                </h3>
                <button
                  onClick={closeAnnouncementForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={editingAnnouncement ? saveEditedAnnouncement : createAnnouncement} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., New Feature Available!"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    id="content"
                    rows={5}
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe what users need to know... (HTML allowed)"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">You can use HTML tags for formatting</p>
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    id="type"
                    value={newAnnouncement.type}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="info">ℹ️ Info - General information</option>
                    <option value="warning">⚠️ Warning - Important notice</option>
                    <option value="success">✅ Success - Good news</option>
                    <option value="error">❌ Error - Critical issue</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700 mb-1">
                    Expires At (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    id="expires_at"
                    value={newAnnouncement.expires_at}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, expires_at: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingAnnouncement ? 'Save Changes' : 'Create Announcement'}
                  </button>
                  <button
                    type="button"
                    onClick={closeAnnouncementForm}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
