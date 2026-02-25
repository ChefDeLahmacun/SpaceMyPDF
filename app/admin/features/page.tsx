'use client';

import React, { useState, useEffect } from 'react';
import UserStatus from '@/app/components/UserStatus';

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  user_email: string;
  user_name: string;
  user_id: string;
  bonus_awarded: boolean;
}

export default function AdminFeatures() {
  const [user, setUser] = useState<any>(null);
  const [features, setFeatures] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedFeature, setSelectedFeature] = useState<FeatureRequest | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/admin';
        return;
      }

      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user?.isAdmin) {
          setUser(data.user);
          await fetchFeatures();
        } else {
          setError('Admin access required');
        }
      } else {
        window.location.href = '/admin';
      }
    } catch (error) {
      console.error('Auth check error:', error);
      window.location.href = '/admin';
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatures = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/feature-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFeatures(data.features);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load feature requests');
      }
    } catch (error) {
      console.error('Error fetching features:', error);
      setError('Failed to load feature requests');
    }
  };

  const updateFeatureStatus = async (featureId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/feature-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          featureId,
          status: newStatus
        })
      });

      if (response.ok) {
        await fetchFeatures(); // Refresh the list
        setSelectedFeature(null); // Close modal
      } else {
        alert('Failed to update feature status');
      }
    } catch (error) {
      console.error('Error updating feature:', error);
      alert('Failed to update feature status');
    }
  };

  const awardBonusMonth = async (featureId: string, userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/award-feature-bonus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          featureId,
          userId
        })
      });

      if (response.ok) {
        await fetchFeatures(); // Refresh the list
        alert('Bonus month awarded successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to award bonus: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error awarding bonus:', error);
      alert('Failed to award bonus month');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin';
  };

  const filteredFeatures = features.filter(feature => {
    const matchesStatus = filterStatus === 'all' || feature.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || feature.priority === filterPriority;
    return matchesStatus && matchesPriority;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">High</span>;
      case 'medium':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Medium</span>;
      case 'low':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Low</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{priority}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'in_progress':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">In Progress</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completed</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feature requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.href = '/admin'}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <a href="/admin" className="text-blue-600 hover:text-blue-800 mr-4">
                ← Back to Admin
              </a>
              <h1 className="text-2xl font-bold text-gray-900">Feature Requests</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                <div className="font-medium">{user?.name || user?.email}</div>
                <div className="text-xs text-gray-500">Admin</div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Priority
              </label>
              <select
                id="priority-filter"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Features Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Feature Requests ({filteredFeatures.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feature
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bonus Awarded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFeatures.map((feature) => (
                  <tr key={feature.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{feature.title}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">{feature.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{feature.user_name}</div>
                        <div className="text-sm text-gray-500">{feature.user_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(feature.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(feature.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {feature.bonus_awarded ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          ✅ Awarded
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          Not Awarded
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(feature.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedFeature(feature)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredFeatures.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No feature requests found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Feature Details Modal */}
      {selectedFeature && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedFeature.title}</h3>
                  <p className="text-sm text-gray-500">Feature Request #{selectedFeature.id}</p>
                </div>
                <button
                  onClick={() => setSelectedFeature(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <div className="flex gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Priority:</span>
                    <div className="mt-1">{getPriorityBadge(selectedFeature.priority)}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <div className="mt-1">{getStatusBadge(selectedFeature.status)}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Bonus Awarded:</span>
                    <div className="mt-1">
                      {selectedFeature.bonus_awarded ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          ✅ Awarded
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          Not Awarded
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-700">User:</span>
                  <div className="mt-1">
                    <div className="text-sm text-gray-900">{selectedFeature.user_name}</div>
                    <div className="text-sm text-gray-500">{selectedFeature.user_email}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-700">Created:</span>
                  <div className="mt-1 text-sm text-gray-900">
                    {new Date(selectedFeature.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-sm font-medium text-gray-700">Description:</span>
                <div className="mt-2 p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedFeature.description}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {!selectedFeature.bonus_awarded && (
                  <button
                    onClick={() => awardBonusMonth(selectedFeature.id, selectedFeature.user_id)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    🎁 Award 1 Month Free
                  </button>
                )}
                <button
                  onClick={() => updateFeatureStatus(selectedFeature.id, 'in_progress')}
                  disabled={selectedFeature.status === 'in_progress'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark In Progress
                </button>
                <button
                  onClick={() => updateFeatureStatus(selectedFeature.id, 'completed')}
                  disabled={selectedFeature.status === 'completed'}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark Completed
                </button>
                <button
                  onClick={() => updateFeatureStatus(selectedFeature.id, 'rejected')}
                  disabled={selectedFeature.status === 'rejected'}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
