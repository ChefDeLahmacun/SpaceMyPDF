'use client';

import React, { useState, useEffect } from 'react';

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  bonus_months: number;
  created_at: string;
  reviewed_at?: string;
}

export default function FeatureRequestList() {
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeatureRequests();
  }, []);

  const fetchFeatureRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to view feature requests');
        return;
      }

      const response = await fetch('/api/feature-requests/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFeatureRequests(data.featureRequests);
      } else {
        throw new Error('Failed to fetch feature requests');
      }
    } catch (error) {
      console.error('Error fetching feature requests:', error);
      setError(error instanceof Error ? error.message : 'Failed to load feature requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'implemented':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
      case 'implemented':
        return '🚀';
      default:
        return '📝';
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
            onClick={fetchFeatureRequests}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (featureRequests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Your Feature Requests
        </h3>
        <div className="text-center text-gray-500 py-8">
          <p>No feature requests submitted yet.</p>
          <p className="text-sm mt-2">Submit your first feature request to help improve SpaceMyPDF!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Your Feature Requests ({featureRequests.length})
      </h3>
      
      <div className="space-y-4">
        {featureRequests.map((request) => (
          <div key={request.id} className="border border-gray-200 rounded-md p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-md font-medium text-gray-900">{request.title}</h4>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                {getStatusIcon(request.status)} {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">
              {request.description}
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div>
                <span>Submitted: {new Date(request.created_at).toLocaleDateString()}</span>
                {request.reviewed_at && (
                  <span className="ml-4">
                    Reviewed: {new Date(request.reviewed_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              {request.bonus_months > 0 && request.status === 'approved' && (
                <span className="text-green-600 font-medium">
                  +{request.bonus_months} bonus month{request.bonus_months > 1 ? 's' : ''} earned!
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}