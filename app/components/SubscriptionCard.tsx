'use client';

import React, { useState, useEffect } from 'react';

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
  const [selectedCurrency, setSelectedCurrency] = useState('GBP');

  useEffect(() => {
    fetchSubscriptionData();
  }, [userId]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
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
      const pricingResponse = await fetch(`/api/stripe/pricing?currency=${selectedCurrency}`);
      if (pricingResponse.ok) {
        const pricingData = await pricingResponse.json();
        setPricing(pricingData.pricing);
      }

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
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: selectedPlan,
          currency: selectedCurrency
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription');
      }

      // Redirect to Stripe checkout or handle success
      alert('Subscription created successfully!');
      fetchSubscriptionData();

    } catch (error) {
      console.error('Error creating subscription:', error);
      setError(error instanceof Error ? error.message : 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

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
        // Existing Subscription
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Status</span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              subscription.status === 'active' 
                ? 'bg-green-100 text-green-800'
                : subscription.status === 'trialing'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Current Period</span>
            <span className="text-sm text-gray-900">
              {new Date(subscription.current_period_start).toLocaleDateString()} - {' '}
              {new Date(subscription.current_period_end).toLocaleDateString()}
            </span>
          </div>

          {subscription.trial_end && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Trial Ends</span>
              <span className="text-sm text-gray-900">
                {new Date(subscription.trial_end).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      ) : user?.subscriptionStatus === 'trial' ? (
        // User is in trial - show trial information
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Status</span>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              Free Trial
            </span>
          </div>

          {user.trialEnd && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Trial Ends</span>
              <span className="text-sm text-gray-900">
                {new Date(user.trialEnd).toLocaleDateString()}
              </span>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              🎉 You're in your free trial!
            </h4>
            <p className="text-sm text-blue-800">
              Enjoy full access to all features during your trial period. No payment required until your trial ends.
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Ready to continue after your trial? Choose a plan below:
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`p-3 border rounded-md text-left ${
                  selectedPlan === 'monthly'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium text-gray-900">Monthly</div>
                <div className="text-sm text-gray-600">
                  {pricing?.monthly ? `£${(pricing.monthly.price / 100).toFixed(2)}/month` : '£3.00/month'}
                </div>
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`p-3 border rounded-md text-left ${
                  selectedPlan === 'yearly'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium text-gray-900">Yearly</div>
                <div className="text-sm text-gray-600">
                  {pricing?.yearly ? `£${(pricing.yearly.price / 100).toFixed(2)}/year` : '£30.00/year'}
                </div>
                <div className="text-xs text-green-600 font-medium">Save 17%</div>
              </button>
            </div>

            <button
              onClick={handleCreateSubscription}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Upgrade Now'}
            </button>
          </div>
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
                  {pricing?.monthly ? `£${(pricing.monthly.price / 100).toFixed(2)}/month` : '£3.00/month'}
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
                  {pricing?.yearly ? `£${(pricing.yearly.price / 100).toFixed(2)}/year` : '£30.00/year'}
                </div>
                <div className="text-xs text-green-600 font-medium">Save 17%</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="GBP">British Pound (£)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
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
