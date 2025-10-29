'use client';

import React, { useState, useEffect } from 'react';

interface PaymentFormProps {
  plan: 'monthly' | 'yearly';
  currency: string;
  onSuccess: (subscriptionId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export default function PaymentForm({ plan, currency, onSuccess, onError, onCancel }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [planPrice, setPlanPrice] = useState<string>('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    postalCode: '',
    country: 'US'
  });

  useEffect(() => {
    fetchPlanPrice();
  }, [plan, currency]);

  const fetchPlanPrice = async () => {
    try {
      const response = await fetch(`/api/stripe/pricing?currency=${currency}`);
      if (response.ok) {
        const data = await response.json();
        const price = data.pricing[plan].price;
        const currencySymbol = data.pricing[plan].currency === 'GBP' ? '£' : 
                              data.pricing[plan].currency === 'USD' ? '$' : '€';
        setPlanPrice(`${currencySymbol}${price.toFixed(2)}`);
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
      // Fallback pricing
      const fallbackPrices = {
        monthly: { GBP: '£3.00', USD: '$3.99', EUR: '€3.49' },
        yearly: { GBP: '£30.00', USD: '$39.99', EUR: '€34.99' }
      };
      setPlanPrice(fallbackPrices[plan][currency as keyof typeof fallbackPrices.monthly] || `$${plan === 'monthly' ? '3.99' : '39.99'}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate card details
      if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardholderName) {
        throw new Error('Please fill in all required fields');
      }

      // Create subscription with payment
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          plan,
          currency,
          paymentMethod: {
            cardNumber: cardDetails.cardNumber.replace(/\s/g, ''),
            expiryDate: cardDetails.expiryDate,
            cvv: cardDetails.cvv,
            cardholderName: cardDetails.cardholderName,
            billingAddress: cardDetails.billingAddress,
            city: cardDetails.city,
            postalCode: cardDetails.postalCode,
            country: cardDetails.country
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      onSuccess(data.subscription.id);

    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Subscription</h3>
        <p className="text-sm text-gray-600">
          {plan === 'monthly' ? 'Monthly' : 'Yearly'} Plan - {planPrice || 'Loading...'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Number *
          </label>
          <input
            type="text"
            name="cardNumber"
            value={cardDetails.cardNumber}
            onChange={(e) => setCardDetails(prev => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }))}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date *
            </label>
            <input
              type="text"
              name="expiryDate"
              value={cardDetails.expiryDate}
              onChange={(e) => setCardDetails(prev => ({ ...prev, expiryDate: formatExpiryDate(e.target.value) }))}
              placeholder="MM/YY"
              maxLength={5}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVV *
            </label>
            <input
              type="text"
              name="cvv"
              value={cardDetails.cvv}
              onChange={handleInputChange}
              placeholder="123"
              maxLength={4}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cardholder Name *
          </label>
          <input
            type="text"
            name="cardholderName"
            value={cardDetails.cardholderName}
            onChange={handleInputChange}
            placeholder="John Doe"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Billing Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Billing Address *
          </label>
          <input
            type="text"
            name="billingAddress"
            value={cardDetails.billingAddress}
            onChange={handleInputChange}
            placeholder="123 Main Street"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* City and Postal Code */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              name="city"
              value={cardDetails.city}
              onChange={handleInputChange}
              placeholder="New York"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code *
            </label>
            <input
              type="text"
              name="postalCode"
              value={cardDetails.postalCode}
              onChange={handleInputChange}
              placeholder="10001"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country *
          </label>
          <select
            name="country"
            value={cardDetails.country}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="US">United States</option>
            <option value="GB">United Kingdom</option>
            <option value="CA">Canada</option>
            <option value="AU">Australia</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
            <option value="ES">Spain</option>
            <option value="IT">Italy</option>
            <option value="NL">Netherlands</option>
            <option value="SE">Sweden</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : `Subscribe - ${planPrice || 'Loading...'}`}
          </button>
        </div>
      </form>
    </div>
  );
}
