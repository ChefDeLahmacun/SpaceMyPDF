'use client';

import React, { useState, useEffect } from 'react';

export default function MembershipBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Show banner for trial users or expired users
        if (data.user.subscriptionStatus === 'trial' || data.user.subscriptionStatus === 'expired') {
          setIsVisible(true);
        }
      }
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleUpgrade = () => {
    // Redirect to subscription page or open upgrade modal
    window.location.href = '/dashboard';
  };

  if (!isVisible || !user) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-1.5 px-3 relative shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <div className="flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            {user.subscriptionStatus === 'trial' && (
              <p className="text-xs sm:text-sm font-medium leading-tight">
                🎉 Free trial active! Upgrade to continue after trial ends.
              </p>
            )}
            {user.subscriptionStatus === 'expired' && (
              <p className="text-xs sm:text-sm font-medium leading-tight">
                ⚠️ Subscription expired. Upgrade now to continue.
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={handleUpgrade}
            className="bg-white text-emerald-600 px-2 py-1 rounded-md text-xs sm:text-sm font-medium hover:bg-gray-100 transition-colors shadow-sm whitespace-nowrap"
          >
            {user.subscriptionStatus === 'trial' ? 'Upgrade' : 'Renew'}
          </button>
          <button
            onClick={handleDismiss}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-1.5 py-1 rounded-md transition-all duration-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}