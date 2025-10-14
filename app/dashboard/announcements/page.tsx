'use client';

import React from 'react';
import Announcements from '@/app/components/Announcements';
import UserStatus from '@/app/components/UserStatus';

export default function AnnouncementsPage() {
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }

    // Get user data
    fetch('/api/auth/verify', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
        } else {
          window.location.href = '/';
        }
      })
      .catch(() => {
        window.location.href = '/';
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6 min-w-0 flex-1">
              <a href="/dashboard" className="text-blue-600 hover:text-blue-800 flex-shrink-0">
                ← Back to Dashboard
              </a>
              <h1 className="text-xl font-semibold text-gray-900 flex-shrink-0">Announcements</h1>
            </div>
            <div className="flex-shrink-0 ml-4">
              <UserStatus onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Latest Updates</h2>
          <p className="text-gray-600 mt-1">
            Stay informed about new features, maintenance, and important announcements.
          </p>
        </div>

        <Announcements />

        {/* Info Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📢 About Announcements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Types of Announcements</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 🚀 New features and updates</li>
                <li>• 🔧 Maintenance and downtime</li>
                <li>• ⚠️ Important security notices</li>
                <li>• 🎉 Bonus opportunities and rewards</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Notification Settings</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Dismiss announcements you've read</li>
                <li>• Important announcements stay visible</li>
                <li>• Check back regularly for updates</li>
                <li>• Email notifications for critical updates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
