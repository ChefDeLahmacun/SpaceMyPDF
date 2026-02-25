'use client';

import React, { useState, useEffect } from 'react';
import UserStatus from '@/app/components/UserStatus';

interface User {
  id: string;
  email: string;
  name: string;
  subscription_status: string;
  trial_ends_at: string | null;
  created_at: string;
  referral_code: string;
  total_referrals?: number;
  admin_granted_premium?: boolean;
  admin_premium_expires_at?: string | null;
}

export default function AdminUsers() {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [grantDuration, setGrantDuration] = useState('1year');
  const [granting, setGranting] = useState(false);

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
          await fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin';
  };

  const handleGrantPremium = async () => {
    if (!selectedUser) return;

    setGranting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/grant-premium', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          duration: grantDuration
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setShowGrantModal(false);
        setSelectedUser(null);
        await fetchUsers(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error granting premium:', error);
      alert('Failed to grant premium membership');
    } finally {
      setGranting(false);
    }
  };

  const handleRevokePremium = async (userId: string) => {
    if (!confirm('Are you sure you want to revoke this admin-granted premium membership?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/grant-premium?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        await fetchUsers(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error revoking premium:', error);
      alert('Failed to revoke premium membership');
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to DELETE this user account?\n\nEmail: ${userEmail}\n\nThis action CANNOT be undone and will delete:\n- User account\n- All referrals\n- All feature requests\n- All analytics data\n- All support tickets`)) {
      return;
    }

    // Double confirmation for safety
    if (!confirm('This is your final warning. The user account will be permanently deleted. Continue?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/delete-user?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        await fetchUsers(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user account');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.subscription_status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>;
      case 'trial':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Trial</span>;
      case 'expired':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Expired</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Cancelled</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getDaysRemaining = (trialEndsAt: string | null) => {
    if (!trialEndsAt) return null;
    const now = new Date();
    const trialEnd = new Date(trialEndsAt);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
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
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Users
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by email or name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                id="filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Users ({filteredUsers.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trial Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referrals
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Premium
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const daysRemaining = getDaysRemaining(user.trial_ends_at);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.subscription_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.subscription_status === 'trial' && daysRemaining !== null ? (
                          <span className={daysRemaining <= 3 ? 'text-red-600 font-medium' : ''}>
                            {daysRemaining} days
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.total_referrals || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.admin_granted_premium ? (
                          <div>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Admin Premium
                            </span>
                            {user.admin_premium_expires_at && (
                              <div className="text-xs text-gray-500 mt-1">
                                Expires: {new Date(user.admin_premium_expires_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col gap-2">
                          <div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(user.referral_code);
                                alert('Referral code copied to clipboard!');
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              Copy Code
                            </button>
                            <button
                              onClick={() => {
                                alert(`User ID: ${user.id}\nEmail: ${user.email}\nReferral Code: ${user.referral_code}\nStatus: ${user.subscription_status}`);
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              Details
                            </button>
                          </div>
                          <div>
                            {user.admin_granted_premium ? (
                              <button
                                onClick={() => handleRevokePremium(user.id)}
                                className="text-red-600 hover:text-red-900 font-medium"
                              >
                                Revoke Premium
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowGrantModal(true);
                                }}
                                className="text-purple-600 hover:text-purple-900 font-medium"
                              >
                                Grant Premium
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              className="text-red-600 hover:text-red-900 font-medium ml-4"
                              title="Delete user account permanently"
                            >
                              🗑️ Delete Account
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Grant Premium Modal */}
      {showGrantModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Grant Premium Membership</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Grant free premium membership to <strong>{selectedUser.name}</strong> ({selectedUser.email})
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <select
                  value={grantDuration}
                  onChange={(e) => setGrantDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={granting}
                >
                  <option value="1month">1 Month</option>
                  <option value="3months">3 Months</option>
                  <option value="6months">6 Months</option>
                  <option value="1year">1 Year</option>
                  <option value="lifetime">Lifetime</option>
                </select>
              </div>

              <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
                <p className="text-xs text-purple-800">
                  <strong>Note:</strong> Admin-granted premium will give the user full access without requiring payment. 
                  This action will be logged for audit purposes.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowGrantModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={granting}
              >
                Cancel
              </button>
              <button
                onClick={handleGrantPremium}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={granting}
              >
                {granting ? 'Granting...' : 'Grant Premium'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
