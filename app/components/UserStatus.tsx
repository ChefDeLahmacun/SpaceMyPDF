'use client';

import React, { useState, useEffect } from 'react';

interface UserStatusProps {
  onLogin?: () => void;
  onLogout?: () => void;
}

export default function UserStatus({ onLogin, onLogout }: UserStatusProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    onLogout?.();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center space-x-2 w-full">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center w-full">
        <button
          onClick={onLogin}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm font-medium"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-3 min-w-0 w-full">
      <div className="text-xs min-w-0 flex-shrink text-center sm:text-left">
        <div className="font-medium text-gray-900 truncate max-w-[120px] sm:max-w-[100px] md:max-w-[140px] lg:max-w-[160px]">
          {user.name || user.email}
        </div>
        <div className="text-gray-600">
          {user.subscriptionStatus === 'trial' && (
            <span className="text-blue-600 text-xs">Trial</span>
          )}
          {user.subscriptionStatus === 'active' && (
            <span className="text-green-600 text-xs">Active</span>
          )}
          {user.subscriptionStatus === 'expired' && (
            <span className="text-red-600 text-xs">Expired</span>
          )}
        </div>
      </div>
      
      <button
        onClick={handleLogout}
        className="px-3 py-1 text-xs text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex-shrink-0 shadow-sm"
      >
        Logout
      </button>
    </div>
  );
}