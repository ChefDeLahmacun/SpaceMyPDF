'use client';

import React, { useState, useEffect } from 'react';

interface ReferralCodeProps {
  referralCode: string;
  onCopy?: () => void;
}

export default function ReferralCode({ referralCode, onCopy }: ReferralCodeProps) {
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    // Generate referral link
    const baseUrl = window.location.origin;
    setReferralLink(`${baseUrl}?ref=${referralCode}`);
  }, [referralCode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      onCopy?.();
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Your Referral Code
      </h3>
      
      <div className="space-y-4">
        {/* Referral Code Display */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-50 border border-gray-300 rounded-md px-3 py-2 font-mono text-lg font-bold text-gray-900">
            {referralCode}
          </div>
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Referral Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Referral Link
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm"
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            How to share your referral code:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Share your referral code: <span className="font-mono font-bold">{referralCode}</span></li>
            <li>• Or share the referral link above</li>
            <li>• When someone signs up with your code, you both get bonus months!</li>
            <li>• You get 3 months, they get 1 month free</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
