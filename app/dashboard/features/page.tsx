'use client';

import React, { useState } from 'react';
import FeatureRequestForm from '@/app/components/FeatureRequestForm';
import FeatureRequestList from '@/app/components/FeatureRequestList';
import UserStatus from '@/app/components/UserStatus';

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState<'submit' | 'my-requests'>('submit');
  const [user, setUser] = useState<any>(null);

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
                <h1 className="text-xl font-semibold text-gray-900 flex-shrink-0">Feature Requests</h1>
              </div>
              <div className="flex-shrink-0 ml-4">
                <UserStatus onLogout={handleLogout} />
              </div>
            </div>
          </div>
        </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('submit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'submit'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Submit Request
            </button>
            <button
              onClick={() => setActiveTab('my-requests')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my-requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Requests
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeTab === 'submit' && (
            <div className="lg:col-span-2">
              <FeatureRequestForm 
                onSubmit={(request) => {
                  setActiveTab('my-requests');
                }}
                onError={(error) => {
                  console.error('Feature request error:', error);
                }}
              />
            </div>
          )}

          {activeTab === 'my-requests' && (
            <div className="lg:col-span-2">
              <FeatureRequestList />
            </div>
          )}

        </div>

        {/* Benefits Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            💡 Feature Request Benefits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🎁</div>
              <h4 className="font-medium text-gray-900 mb-2">Potential Bonus</h4>
              <p className="text-sm text-gray-600">
                May receive 1 bonus month for exceptional feature requests (admin discretion)
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🚀</div>
              <h4 className="font-medium text-gray-900 mb-2">Early Access</h4>
              <p className="text-sm text-gray-600">
                Be the first to try new features you suggested
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">👥</div>
              <h4 className="font-medium text-gray-900 mb-2">Help Community</h4>
              <p className="text-sm text-gray-600">
                Your ideas help improve SpaceMyPDF for everyone
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
