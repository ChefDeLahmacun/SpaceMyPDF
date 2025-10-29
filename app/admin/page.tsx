'use client';

import React, { useState, useEffect } from 'react';
import UserStatus from '@/app/components/UserStatus';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  trialUsers: number;
  paidUsers: number;
  totalReferrals: number;
  pendingSupportTickets: number;
  pendingFeatureRequests: number;
  totalPDFsProcessed: number;
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'support_ticket' | 'feature_request' | 'referral';
  description: string;
  timestamp: string;
  user_email?: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        await fetchAdminData();
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

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentActivity(data.recentActivity);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load admin data');
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to load admin data');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Access Denied</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go Home
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
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <span className="ml-3 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                ADMIN
              </span>
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
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <a
            href="/admin/users"
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6 hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
          >
            <h3 className="text-lg font-semibold mb-2">Manage Users</h3>
            <p className="text-sm text-blue-100">View, search, and manage all users</p>
          </a>
          
          <a
            href="/admin/grant-access"
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6 hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            <h3 className="text-lg font-semibold mb-2">Grant Premium Access</h3>
            <p className="text-sm text-purple-100">Give users free premium membership</p>
          </a>

          <a
            href="/dashboard"
            className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6 hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
          >
            <h3 className="text-lg font-semibold mb-2">User Dashboard</h3>
            <p className="text-sm text-green-100">View the regular user dashboard</p>
          </a>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Trial Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.trialUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.paidUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Support</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingSupportTickets}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Feature Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingFeatureRequests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-teal-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-600">PDFs Processed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPDFsProcessed}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/admin/users"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-500">View and manage user accounts</p>
              </div>
            </a>

            <a
              href="/admin/support"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Support Tickets</p>
                <p className="text-sm text-gray-500">Manage support requests</p>
              </div>
            </a>

            <a
              href="/admin/features"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Feature Requests</p>
                <p className="text-sm text-gray-500">Review feature suggestions</p>
              </div>
            </a>

            <a
              href="/admin/settings"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Settings</p>
                <p className="text-sm text-gray-500">System configuration</p>
              </div>
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium text-gray-900">{activity.description}</p>
                    {activity.user_email && (
                      <p className="text-sm text-gray-500">{activity.user_email}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      activity.type === 'user_registration' ? 'bg-green-100 text-green-800' :
                      activity.type === 'support_ticket' ? 'bg-red-100 text-red-800' :
                      activity.type === 'feature_request' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {activity.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
