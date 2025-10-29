'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface SubscriptionCardProps {
  userId: string;
  user?: {
    subscriptionStatus: string;
    trialEnd?: string;
  };
}

interface Subscription {
  id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
}

interface Pricing {
  monthly: {
    price: number;
    name: string;
    currency: string;
  };
  yearly: {
    price: number;
    name: string;
    currency: string;
  };
}

export default function SubscriptionCard({ userId, user }: SubscriptionCardProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [cancelling, setCancelling] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatPrice = (price: number, period: string) => {
    return '£' + price.toFixed(2) + '/' + period;
  };

  const fetchPricing = useCallback(async () => {
    try {
      const pricingResponse = await fetch(`/api/stripe/pricing?currency=GBP`);
      if (pricingResponse.ok) {
        const pricingData = await pricingResponse.json();
        setPricing(pricingData.pricing);
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchSubscriptionData();
    }
  }, [userId]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Check if we're in the browser
      if (typeof window === 'undefined') {
        return;
      }
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please log in to view subscription');
      }

      // Fetch subscription data
      const response = await fetch('/api/stripe/subscription', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }

      // Fetch pricing data
      await fetchPricing();

    } catch (error) {
      console.error('Error fetching subscription data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we're in the browser
      if (typeof window === 'undefined') {
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: selectedPlan,
          currency: 'GBP'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.checkoutUrl;

    } catch (error) {
      console.error('Error creating subscription:', error);
      setError(error instanceof Error ? error.message : 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.'
    );
    
    if (!confirmed) return;

    try {
      setCancelling(true);
      setError(null);

      // Check if we're in the browser
      if (typeof window === 'undefined') {
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscriptionId: subscription.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      await fetchSubscriptionData();
      
      alert('Subscription cancelled successfully. You will retain access until the end of your current billing period.');

    } catch (error) {
      console.error('Error cancelling subscription:', error);
      setError(error instanceof Error ? error.message : 'Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to reactivate your subscription? It will resume automatic billing.'
    );
    
    if (!confirmed) return;

    try {
      setCancelling(true);
      setError(null);

      // Check if we're in the browser
      if (typeof window === 'undefined') {
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch('/api/stripe/reactivate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscriptionId: subscription.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reactivate subscription');
      }

      // Refresh subscription data
      await fetchSubscriptionData();
      
      alert('Subscription reactivated successfully!');

    } catch (error) {
      console.error('Error reactivating subscription:', error);
      setError(error instanceof Error ? error.message : 'Failed to reactivate subscription');
    } finally {
      setCancelling(false);
    }
  };

  if (!isClient) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={fetchSubscriptionData}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Subscription Management
      </h3>

      {subscription ? (
        // Existing Subscription - ALWAYS show this if there's a Stripe subscription
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Status</span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              subscription.status === 'active' 
                ? 'bg-green-100 text-green-800'
                : subscription.status === 'trialing'
                ? 'bg-blue-100 text-blue-800'
                : subscription.status === 'cancelled'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Current Period</span>
            <span className="text-sm text-gray-900">
              {new Date(subscription.current_period_start).toLocaleDateString()} - {new Date(subscription.current_period_end).toLocaleDateString()}
            </span>
          </div>

          {subscription.status === 'active' && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-green-900 mb-2">
                ✅ Active Subscription
              </h4>
              <p className="text-sm text-green-800 mb-3">
                You have full access to all features. Your subscription will automatically renew.
              </p>
              <div className="text-right">
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="text-xs text-gray-500 hover:text-red-600 underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel subscription'}
                </button>
              </div>
            </div>
          )}

          {subscription.status === 'cancelled' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-yellow-900 mb-2">
                ⚠️ Subscription Cancelled
              </h4>
              <p className="text-sm text-yellow-800 mb-3">
                Your subscription has been cancelled. You will retain access until {new Date(subscription.current_period_end).toLocaleDateString()}.
              </p>
              <button
                onClick={handleReactivateSubscription}
                disabled={cancelling}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {cancelling ? 'Reactivating...' : 'Reactivate Subscription'}
              </button>
            </div>
          )}

          {subscription.status === 'trialing' && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                🎉 Free Trial Active
              </h4>
              <p className="text-sm text-blue-800 mb-3">
                You're currently on a free trial. Upgrade now to continue using all features after your trial ends.
              </p>
              <button
                onClick={handleCreateSubscription}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating...' : 'Upgrade Now'}
              </button>
            </div>
          )}
        </div>
      ) : (
        // No Subscription - Create One
        <div className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Plan
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`p-4 border rounded-md text-left ${
                  selectedPlan === 'monthly'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium text-gray-900">Monthly</div>
                <div className="text-sm text-gray-600">
                  {pricing?.monthly ? formatPrice(pricing.monthly.price, 'month') : formatPrice(5.00, 'month')}
                </div>
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`p-4 border rounded-md text-left ${
                  selectedPlan === 'yearly'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium text-gray-900">Yearly</div>
                <div className="text-sm text-gray-600">
                  {pricing?.yearly ? formatPrice(pricing.yearly.price, 'year') : formatPrice(50.00, 'year')}
                </div>
                <div className="text-xs text-green-600 font-medium">Save 17%</div>
              </button>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-green-900 mb-2">
              🎉 Free Trial Included
            </h4>
            <p className="text-sm text-green-800">
              Start with a 30-day free trial. No payment required until your trial ends.
            </p>
          </div>

          <button
            onClick={handleCreateSubscription}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating...' : 'Start Free Trial'}
          </button>
        </div>
      )}

    </div>
  );
}