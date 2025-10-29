'use client';

import React, { useState, useEffect } from 'react';
import MembershipModal from './MembershipModal';

interface DownloadRestrictionProps {
  onDownload: () => void;
  children: React.ReactNode;
}

export default function DownloadRestriction({ onDownload, children }: DownloadRestrictionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDownloadTriggered, setIsDownloadTriggered] = useState(false);

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

      // Verify token with backend
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUser(data.user);
      } else if (response.status === 401) {
        // Token is invalid, silently clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        console.error('Auth verification failed:', response.status);
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

  const handleDownloadClick = () => {
    if (!isAuthenticated) {
      setIsDownloadTriggered(true);
      setShowMembershipModal(true);
      return;
    }

    // Check if user has active subscription
    if (user?.subscriptionStatus === 'expired' || user?.subscriptionStatus === 'cancelled') {
      setIsDownloadTriggered(true);
      setShowMembershipModal(true);
      return;
    }

    // User is authenticated and has active subscription, proceed with download
    onDownload();
  };

  if (loading) {
    return (
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
    );
  }

  return (
    <>
      <div onClick={handleDownloadClick} className="cursor-pointer">
        {children}
      </div>
      
      <MembershipModal
        isOpen={showMembershipModal}
        onClose={() => {
          setShowMembershipModal(false);
          setIsDownloadTriggered(false);
        }}
        onSignUp={() => {
          setShowMembershipModal(false);
          // Only trigger download if this was initiated by download attempt
          if (isDownloadTriggered) {
            // Refresh auth status after signup and trigger download
            setTimeout(async () => {
              await checkAuthStatus();
              // Check if user is authenticated and has active subscription
              const token = localStorage.getItem('token');
              if (token) {
                try {
                  const response = await fetch('/api/auth/verify', {
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  if (response.ok) {
                    const data = await response.json();
                    if (data.user?.subscriptionStatus !== 'expired' && data.user?.subscriptionStatus !== 'cancelled') {
                      onDownload();
                    }
                  }
                } catch (error) {
                  console.error('Auth verification error:', error);
                }
              }
              setIsDownloadTriggered(false);
            }, 2000);
          }
        }}
        onLogin={() => {
          setShowMembershipModal(false);
          // Only trigger download if this was initiated by download attempt
          if (isDownloadTriggered) {
            // Refresh auth status after login and trigger download
            setTimeout(async () => {
              await checkAuthStatus();
              // Check if user is authenticated and has active subscription
              const token = localStorage.getItem('token');
              if (token) {
                try {
                  const response = await fetch('/api/auth/verify', {
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  if (response.ok) {
                    const data = await response.json();
                    if (data.user?.subscriptionStatus !== 'expired' && data.user?.subscriptionStatus !== 'cancelled') {
                      onDownload();
                    }
                  }
                } catch (error) {
                  console.error('Auth verification error:', error);
                }
              }
              setIsDownloadTriggered(false);
            }, 2000);
          }
        }}
      />
    </>
  );
}