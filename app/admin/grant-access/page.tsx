'use client';

import React, { useState, useEffect } from 'react';

export default function AdminGrantAccess() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [duration, setDuration] = useState('1year');
  const [granting, setGranting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleGrantPremium = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!referralCode.trim()) {
      setMessage({ type: 'error', text: 'Please enter a referral code' });
      return;
    }

    setGranting(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/grant-premium', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          referralCode: referralCode.trim(),
          duration: duration
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setReferralCode(''); // Clear the form
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to grant premium' });
      }
    } catch (error) {
      console.error('Error granting premium:', error);
      setMessage({ type: 'error', text: 'Failed to grant premium membership' });
    } finally {
      setGranting(false);
    }
  };

  if (loading) {
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <a href="/admin" className="text-blue-600 hover:text-blue-800 mr-4">
                ← Back to Admin
              </a>
              <h1 className="text-2xl font-bold text-gray-900">Grant Premium Access</h1>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Grant Premium by Referral Code</h2>
            <p className="text-sm text-gray-600">
              Enter a user's referral code to grant them free premium membership. This is useful when you want to reward specific users or provide complimentary access.
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </p>
            </div>
          )}

          <form onSubmit={handleGrantPremium} className="space-y-6">
            <div>
              <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-2">
                Referral Code
              </label>
              <input
                type="text"
                id="referralCode"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Enter user's referral code (e.g., ABC123)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={granting}
              />
              <p className="mt-1 text-xs text-gray-500">
                You can find a user's referral code in the "Manage Users" page
              </p>
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={granting}
              >
                <option value="1month">1 Month</option>
                <option value="3months">3 Months</option>
                <option value="6months">6 Months</option>
                <option value="1year">1 Year (Recommended)</option>
                <option value="lifetime">Lifetime</option>
              </select>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
              <h3 className="text-sm font-semibold text-purple-900 mb-2">Important Notes:</h3>
              <ul className="text-xs text-purple-800 space-y-1 list-disc list-inside">
                <li>Admin-granted premium gives users full access without payment</li>
                <li>The user will be notified that they have premium access</li>
                <li>This action will be logged for audit purposes</li>
                <li>You can revoke admin-granted premium from the "Manage Users" page</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3">
              <a
                href="/admin/users"
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Go to Manage Users
              </a>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={granting}
              >
                {granting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Granting...
                  </span>
                ) : (
                  'Grant Premium Access'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Guide */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">Quick Guide</h3>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>Find the user you want to grant access to in the <a href="/admin/users" className="underline font-medium">Manage Users</a> page</li>
            <li>Copy their referral code using the "Copy Code" button</li>
            <li>Return to this page and paste the referral code</li>
            <li>Select the duration for the premium access</li>
            <li>Click "Grant Premium Access" to complete</li>
          </ol>
          <p className="mt-3 text-xs text-blue-700">
            <strong>Tip:</strong> You can also grant premium directly from the Manage Users page by clicking the "Grant Premium" button next to any user.
          </p>
        </div>
      </div>
    </div>
  );
}

