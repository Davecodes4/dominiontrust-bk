'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BellIcon,
  FunnelIcon,
  CheckIcon,
  EyeIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ProtectedRoute from '../../components/ProtectedRoute';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { NotificationIcon } from '../../components/NotificationDropdown';
import { useNotifications } from '../../hooks/useNotifications';
import { Notification } from '../../lib/api';

export default function NotificationsPage() {
  const {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = (notifications || []).filter(notification => {
    const matchesReadFilter = 
      filter === 'all' || 
      (filter === 'unread' && !notification.is_read) ||
      (filter === 'read' && notification.is_read);
    
    const matchesTypeFilter = 
      typeFilter === 'all' || notification.type === typeFilter;

    return matchesReadFilter && matchesTypeFilter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeColor = (type: string) => {
    // Handle both specific types and general categories
    if (type.includes('transaction') || type.includes('transfer') || type.includes('payment')) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (type.includes('security') || type.includes('login') || type.includes('suspicious')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    if (type.includes('account') || type.includes('profile')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (type.includes('card')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    if (type.includes('kyc') || type.includes('document')) {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    if (type.includes('system') || type.includes('maintenance')) {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
    if (type.includes('marketing') || type.includes('promotion')) {
      return 'bg-pink-100 text-pink-800 border-pink-200';
    }
    if (type.includes('two_factor') || type.includes('2fa')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    
    // Default fallback
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'transaction': return 'Transaction';
      case 'security': return 'Security';
      case 'account': return 'Account';
      case 'card': return 'Card';
      case 'kyc': return 'KYC';
      case 'system': return 'System';
      case 'marketing': return 'Promotion';
      case 'two_factor': return '2FA';
      default: 
        // Handle snake_case to Title Case conversion
        return String(type)
          .split('_')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
    }
  };

  if (loading && (notifications || []).length === 0) {
    return (
      <ProtectedRoute requireProfileCompletion={true}>
        <DashboardLayout>
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading notifications...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireProfileCompletion={true}>
      <DashboardLayout>
        <div className="p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <BellIcon className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
                    <p className="text-sm text-muted-foreground">
                      {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    onClick={fetchNotifications}
                    size="sm"
                    variant="ghost"
                    className="flex items-center space-x-2"
                    disabled={loading}
                  >
                    <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                  
                  {unreadCount > 0 && (
                    <Button
                      onClick={markAllAsRead}
                      size="sm"
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <CheckIcon className="h-4 w-4" />
                      <span>Mark all as read</span>
                    </Button>
                  )}
                  
                  <Button
                    onClick={fetchNotifications}
                    size="sm"
                    variant="outline"
                    className="flex items-center space-x-2"
                    disabled={loading}
                  >
                    <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <Card className="p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <FunnelIcon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex space-x-2">
                      {(['all', 'unread', 'read'] as const).map((filterOption) => (
                        <button
                          key={filterOption}
                          onClick={() => setFilter(filterOption)}
                          className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            filter === filterOption
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                          }`}
                        >
                          {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="px-3 py-1 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">All Types</option>
                      <option value="transaction">Transaction</option>
                      <option value="transfer">Transfer</option>
                      <option value="security">Security</option>
                      <option value="account">Account</option>
                      <option value="card">Card</option>
                      <option value="kyc">KYC</option>
                      <option value="system">System</option>
                      <option value="marketing">Marketing</option>
                      <option value="two_factor">2FA</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* Error State */}
              {error && (
                <Card className="p-6 mb-6 border-red-200 bg-red-50">
                  <p className="text-red-800">{error}</p>
                  <Button
                    onClick={fetchNotifications}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </Card>
              )}

              {/* Notifications List */}
              <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                  <Card className="p-8 text-center">
                    <BellIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                    </h3>
                    <p className="text-muted-foreground">
                      {filter === 'unread' 
                        ? 'All your notifications have been read!' 
                        : 'You\'ll see important updates and alerts here.'
                      }
                    </p>
                  </Card>
                ) : (
                  filteredNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card
                        className={`p-4 transition-all duration-200 hover:shadow-md ${
                          !notification.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 mt-1">
                            <NotificationIcon 
                              type={notification.type}
                              className="h-6 w-6"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className={`text-base font-semibold leading-6 ${
                                  !notification.is_read ? 'text-foreground' : 'text-muted-foreground'
                                }`}>
                                  {notification.title}
                                </h3>
                                <div className="mt-2">
                                  <p className={`text-sm leading-relaxed ${
                                    !notification.is_read ? 'text-foreground' : 'text-muted-foreground'
                                  }`}>
                                    {notification.message}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 ml-4">
                                {!notification.is_read && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="p-1 text-muted-foreground hover:text-primary transition-colors"
                                    title="Mark as read"
                                  >
                                    <EyeIcon className="h-4 w-4" />
                                  </button>
                                )}
                                <div className="w-2 h-2 rounded-full bg-muted-foreground opacity-50" />
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center space-x-3">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(notification.type)}`}>
                                  {getTypeLabel(notification.type)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(notification.created_at)}
                                </span>
                              </div>

                              {!notification.is_read && (
                                <div className="flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span className="text-xs text-blue-600 font-medium">New</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Load More Button (if needed) */}
              {filteredNotifications.length > 0 && (
                <div className="mt-8 text-center">
                  <Button
                    variant="outline"
                    onClick={fetchNotifications}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
