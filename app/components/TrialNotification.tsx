'use client';

import React, { useState, useEffect } from 'react';

interface TrialNotificationProps {
  user: {
    trialEnd?: string;
    subscriptionStatus: string;
  };
  hasActiveSubscription?: boolean; // Add this prop to check if user has active Stripe subscription
  onClose?: () => void;
}

export default function TrialNotification({ user, hasActiveSubscription = false, onClose }: TrialNotificationProps) {
  const [show, setShow] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    // Don't show trial notification if user has an active subscription
    if (hasActiveSubscription) {
      setShow(false);
      return;
    }

    if (user.subscriptionStatus === 'trial' && user.trialEnd) {
      // Check if notification was dismissed
      const dismissed = localStorage.getItem('trial-notification-dismissed');
      if (dismissed) {
        return;
      }

      const trialEndDate = new Date(user.trialEnd);
      const now = new Date();
      const diffTime = trialEndDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setDaysRemaining(Math.max(0, diffDays));
      setShow(true);
    }
  }, [user, hasActiveSubscription]);

  if (!show || user.subscriptionStatus !== 'trial') {
    return null;
  }

  const handleClose = () => {
    setShow(false);
    onClose?.();
  };

  const getTrialMessage = () => {
    if (daysRemaining === 0) {
      return "Your free trial has ended. Upgrade to continue using SpaceMyPDF!";
    } else if (daysRemaining === 1) {
      return "Your free trial ends tomorrow. Upgrade now to continue!";
    } else if (daysRemaining <= 3) {
      return `Your free trial ends in ${daysRemaining} days. Upgrade now to continue!`;
    } else {
      return `Welcome to SpaceMyPDF! You have ${daysRemaining} days left in your 30-day free trial.`;
    }
  };

  const getNotificationType = () => {
    if (daysRemaining === 0) {
      return 'error';
    } else if (daysRemaining <= 3) {
      return 'warning';
    } else {
      return 'success';
    }
  };

  const notificationType = getNotificationType();
  const bgColor = notificationType === 'error' ? 'bg-red-50 border-red-200' :
                   notificationType === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                   'bg-green-50 border-green-200';
  
  const textColor = notificationType === 'error' ? 'text-red-800' :
                   notificationType === 'warning' ? 'text-yellow-800' :
                   'text-green-800';

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md ${bgColor} border rounded-lg shadow-lg`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {notificationType === 'error' && (
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {notificationType === 'warning' && (
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {notificationType === 'success' && (
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${textColor}`}>
              {notificationType === 'success' ? 'Welcome to SpaceMyPDF!' : 'Trial Status'}
            </h3>
            <p className={`mt-1 text-sm ${textColor}`}>
              {getTrialMessage()}
            </p>
            {daysRemaining > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Days remaining</span>
                  <span>{daysRemaining}</span>
                </div>
                <div className="mt-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full ${
                      notificationType === 'error' ? 'bg-red-500' :
                      notificationType === 'warning' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.max(5, Math.min(100, (daysRemaining / 30) * 100))}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className={`inline-flex ${textColor} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              <span className="sr-only">Close</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        {daysRemaining > 0 && (
          <div className="mt-3">
            <button
              onClick={() => {
                // Navigate to subscription page or open upgrade modal
                window.location.href = '/dashboard?tab=subscription';
              }}
              className={`w-full text-center px-3 py-2 text-sm font-medium rounded-md ${
                notificationType === 'error' ? 'bg-red-600 text-white hover:bg-red-700' :
                notificationType === 'warning' ? 'bg-yellow-600 text-white hover:bg-yellow-700' :
                'bg-green-600 text-white hover:bg-green-700'
              } transition-colors`}
            >
              {daysRemaining === 0 ? 'Upgrade Now' : 'View Plans'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
