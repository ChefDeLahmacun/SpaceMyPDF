'use client';

import React, { useState } from 'react';

interface ReferralFormProps {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export default function ReferralForm({ onSuccess, onError }: ReferralFormProps) {
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!referralCode.trim()) {
      setError('Please enter a referral code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to use a referral code');
      }

      const response = await fetch('/api/referrals/use-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          referralCode: referralCode.trim().toUpperCase()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply referral code');
      }

      // Success
      setReferralCode('');
      onSuccess?.(`Referral code applied! You got ${data.bonus.refereeBonus} bonus month(s)!`);
      
      // Refresh the page or update user data
      window.location.reload();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply referral code';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setReferralCode(value);
    setError(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Use a Referral Code
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-2">
            Enter Referral Code
          </label>
          <input
            type="text"
            id="referralCode"
            value={referralCode}
            onChange={handleInputChange}
            placeholder="ABC12345"
            maxLength={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the referral code given to you by another user
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !referralCode.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Applying...' : 'Apply Referral Code'}
        </button>
      </form>

      <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-green-900 mb-2">
          🎉 Referral Benefits
        </h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• You get 1 additional month free</li>
          <li>• The person who referred you gets 3 months free</li>
          <li>• Both bonuses are added to your trial period</li>
        </ul>
      </div>
    </div>
  );
}
