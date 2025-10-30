'use client';

import React, { useState, useEffect } from 'react';
import UserStatus from '@/app/components/UserStatus';
import MembershipModal from '@/app/components/MembershipModal';
import TrialNotification from '@/app/components/TrialNotification';
import SubscriptionCard from '@/app/components/SubscriptionCard';

interface User {
  id: string;
  email: string;
  subscriptionStatus: string;
  phone?: string;
  phoneVerified: boolean;
  referralCode: string;
  trialEnd?: string;
  created_at?: string;
  adminGrantedPremium?: boolean;
  adminPremiumExpiresAt?: string;
}

interface DashboardStats {
  pdfsProcessed: number;
  referralsCount: number;
  featureRequestsCount: number;
  daysRemaining: number;
}

interface Activity {
  id: string;
  activity_type: string;
  bonus_months: number;
  description: string;
  created_at: string;
}

export default function DashboardPage() {
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Helper function to format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  };

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      checkAuthStatus();
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
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
        await fetchDashboardStats(data.user.id, data.user);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async (userId: string, userData: User) => {
    try {
      const [analyticsRes, referralsRes, featuresRes, activitiesRes] = await Promise.all([
        fetch('/api/analytics/user-stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/referrals/my-referrals', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/feature-requests/list', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/bonus-activities/user-activities', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const analytics = analyticsRes.ok ? await analyticsRes.json() : { pdfsProcessed: 0 };
      const referrals = referralsRes.ok ? await referralsRes.json() : { referrals: [] };
      const features = featuresRes.ok ? await featuresRes.json() : { requests: [] };
      const activities = activitiesRes.ok ? await activitiesRes.json() : { activities: [] };

      const daysRemaining = userData?.trialEnd ? 
        Math.max(0, Math.floor((new Date(userData.trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
      

      setStats({
        pdfsProcessed: analytics.pdfsProcessed || 0,
        referralsCount: referrals.referrals?.length || 0,
        featureRequestsCount: features.requests?.length || 0,
        daysRemaining
      });

      setRecentActivities(activities.activities || []);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const handleSignIn = () => {
    setShowMembershipModal(true);
  };

  const handleModalClose = () => {
    setShowMembershipModal(false);
  };

  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const copyReferralCode = async () => {
    if (user?.referralCode) {
      await navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white shadow-sm border-b flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-6 min-w-0 flex-1">
                <h1 className="text-xl font-semibold text-gray-900 flex-shrink-0">Dashboard</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Trial Notification */}
      {user && (
        <TrialNotification 
          user={user} 
          onClose={() => {
            // Store notification dismissal in localStorage
            localStorage.setItem('trial-notification-dismissed', 'true');
          }}
        />
      )}
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6 min-w-0 flex-1">
              <button
                onClick={handleGoBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
                title="Go back"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <h1 className="text-xl font-semibold text-gray-900 flex-shrink-0">Dashboard</h1>
            </div>
            <div className="flex-shrink-0 ml-4">
              <UserStatus onLogin={handleSignIn} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        ) : !user ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to SpaceMyPDF!</h2>
            <p className="text-gray-600 mb-6">Please sign in to access your dashboard.</p>
            <button
              onClick={handleSignIn}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        ) : (
          <>
            {/* Welcome Message */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome back, {user.email.split('@')[0]}!
              </h2>
              <p className="text-gray-600 mt-1">
                Manage your subscription, track your usage, and explore new features.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {user.subscriptionStatus}
                    </p>
                    {user.subscriptionStatus === 'trial' && stats && (
                      <p className="text-xs text-gray-500">{stats.daysRemaining} days left</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">PDFs Processed</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {stats?.pdfsProcessed || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Referrals</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {stats?.referralsCount || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Feature Requests</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {stats?.featureRequestsCount || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Management & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h3>
                <SubscriptionCard userId={user.id} user={user} />
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <a
                    href="/dashboard/change-password"
                    className="block w-full px-4 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    🔐 Change Password
                  </a>
                  <a
                    href="/dashboard/features"
                    className="block w-full px-4 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    📝 Submit Feature Request
                  </a>
                  <a
                    href="/dashboard/referrals"
                    className="block w-full px-4 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    🔗 Manage Referrals
                  </a>
                  <a
                    href="/dashboard/settings"
                    className="block w-full px-4 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    ⚙️ Account Settings
                  </a>
                  <a
                    href="/dashboard/support"
                    className="block w-full px-4 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    🆘 Get Support
                  </a>
                  <a
                    href="/dashboard/announcements"
                    className="block w-full px-4 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    📢 View Announcements
                  </a>
                  <button
                    onClick={copyReferralCode}
                    className="block w-full px-4 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    📋 {copied ? 'Copied!' : 'Copy Referral Code'}: {user.referralCode}
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {/* Account created */}
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Account created successfully</span>
                  <span className="ml-auto text-gray-400">
                    {user.created_at ? formatTimeAgo(user.created_at) : 'Recently'}
                  </span>
                </div>

                {/* Free trial started */}
                {user.subscriptionStatus === 'trial' && (
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span>Free trial started</span>
                    <span className="ml-auto text-gray-400">
                      {user.trialEnd ? formatTimeAgo(user.trialEnd) : 'Recently'}
                    </span>
                  </div>
                )}

                {/* Bonus activities (referrals, feature requests, admin grants) */}
                {recentActivities && recentActivities.length > 0 && recentActivities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start text-sm text-gray-600">
                    <div className={`w-2 h-2 rounded-full mr-3 mt-1 ${
                      activity.activity_type === 'admin_award' ? 'bg-purple-500' :
                      activity.activity_type === 'referral' ? 'bg-blue-500' :
                      activity.activity_type === 'feature_request' ? 'bg-orange-500' : 'bg-gray-500'
                    }`}></div>
                    <div className="flex-1">
                      <span className="block">{activity.description}</span>
                      {activity.bonus_months > 0 && (
                        <span className="text-xs text-green-600 font-medium">
                          +{activity.bonus_months} bonus months
                        </span>
                      )}
                    </div>
                    <span className="ml-2 text-gray-400 whitespace-nowrap">
                      {formatTimeAgo(activity.created_at)}
                    </span>
                  </div>
                ))}

                {/* PDFs processed */}
                {stats && stats.pdfsProcessed > 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                    <span>{stats.pdfsProcessed} PDFs processed</span>
                    <span className="ml-auto text-gray-400">Recently</span>
                  </div>
                )}

                {/* Empty state */}
                {(!recentActivities || recentActivities.length === 0) && stats && stats.pdfsProcessed === 0 && (
                  <p className="text-sm text-gray-400 italic">No recent activities yet</p>
                )}
              </div>
            </div>

          </>
        )}
      </div>

      {/* Membership Modal */}
      <MembershipModal
        isOpen={showMembershipModal}
        onClose={handleModalClose}
        onSignUp={handleModalClose}
        onLogin={handleModalClose}
      />
    </div>
  );
}