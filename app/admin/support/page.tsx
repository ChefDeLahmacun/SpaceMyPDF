'use client';

import React, { useState, useEffect } from 'react';
import UserStatus from '@/app/components/UserStatus';

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_email: string;
  user_name: string;
}

export default function AdminSupport() {
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

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
          await fetchTickets();
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

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/support-tickets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load support tickets');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Failed to load support tickets');
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/support-tickets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ticketId,
          status: newStatus
        })
      });

      if (response.ok) {
        await fetchTickets(); // Refresh the list
        setSelectedTicket(null); // Close modal
      } else {
        alert('Failed to update ticket status');
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('Failed to update ticket status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin';
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    return matchesStatus && matchesPriority;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Urgent</span>;
      case 'high':
        return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">High</span>;
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
      case 'open':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Open</span>;
      case 'in_progress':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">In Progress</span>;
      case 'resolved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Resolved</span>;
      case 'closed':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Closed</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading support tickets...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
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
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
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
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Support Tickets ({filteredTickets.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
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
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">#{ticket.id}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">{ticket.subject}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{ticket.user_name}</div>
                        <div className="text-sm text-gray-500">{ticket.user_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(ticket.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
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

        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No support tickets found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Ticket #{selectedTicket.id}</h3>
                  <p className="text-sm text-gray-500">{selectedTicket.subject}</p>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
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
                    <div className="mt-1">{getPriorityBadge(selectedTicket.priority)}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-700">User:</span>
                  <div className="mt-1">
                    <div className="text-sm text-gray-900">{selectedTicket.user_name}</div>
                    <div className="text-sm text-gray-500">{selectedTicket.user_email}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-700">Created:</span>
                  <div className="mt-1 text-sm text-gray-900">
                    {new Date(selectedTicket.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-sm font-medium text-gray-700">Message:</span>
                <div className="mt-2 p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => updateTicketStatus(selectedTicket.id, 'in_progress')}
                  disabled={selectedTicket.status === 'in_progress'}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark In Progress
                </button>
                <button
                  onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
                  disabled={selectedTicket.status === 'resolved'}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark Resolved
                </button>
                <button
                  onClick={() => updateTicketStatus(selectedTicket.id, 'closed')}
                  disabled={selectedTicket.status === 'closed'}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Close Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
