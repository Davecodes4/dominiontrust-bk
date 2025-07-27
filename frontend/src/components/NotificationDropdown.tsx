import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  CreditCardIcon, 
  UserCircleIcon, 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  MegaphoneIcon, 
  LockClosedIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { Notification } from '../lib/api';
import { useNotifications } from '../hooks/useNotifications';

// Icon mapping function for notification types
const getNotificationIcon = (type: string): React.ElementType => {
  if (type.includes('transaction') || type.includes('transfer') || type.includes('payment')) {
    return CreditCardIcon;
  }
  if (type.includes('security') || type.includes('login') || type.includes('suspicious')) {
    return ShieldCheckIcon;
  }
  if (type.includes('account') || type.includes('profile')) {
    return UserCircleIcon;
  }
  if (type.includes('card')) {
    return CreditCardIcon;
  }
  if (type.includes('kyc') || type.includes('document')) {
    return DocumentTextIcon;
  }
  if (type.includes('marketing') || type.includes('promotion')) {
    return MegaphoneIcon;
  }
  if (type.includes('system') || type.includes('maintenance')) {
    return ExclamationTriangleIcon;
  }
  if (type.includes('two_factor') || type.includes('2fa')) {
    return LockClosedIcon;
  }
  
  return BellIcon; // Default fallback
};

export const NotificationIcon: React.FC<{ type: string; className?: string }> = ({ type, className }) => {
  const Icon = getNotificationIcon(type);
  return <Icon className={className || 'h-5 w-5'} />;
};

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const {
    recentNotifications,
    loading,
    unreadCount,
    fetchRecentNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  useEffect(() => {
    fetchRecentNotifications();
  }, [fetchRecentNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
    // Navigate based on notification type
    switch (notification.type) {
      case 'transaction':
        router.push('/history');
        break;
      case 'account':
        router.push('/accounts');
        break;
      case 'kyc':
        router.push('/kyc-documents');
        break;
      case 'security':
      case 'two_factor':
        router.push('/settings?tab=security');
        break;
      default:
        router.push('/notifications');
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    router.push('/notifications');
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[20px] h-5">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-primary hover:text-primary/80 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {loading && recentNotifications.length === 0 ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="p-6 text-center">
                  <BellIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">No notifications</p>
                  <p className="text-xs text-muted-foreground">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentNotifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full text-left p-4 hover:bg-secondary transition-colors ${
                        !notification.is_read ? 'bg-blue-50/30 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <NotificationIcon type={notification.type} className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            !notification.is_read ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatTime(notification.created_at)}
                            </span>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {recentNotifications.length > 0 && (
              <div className="p-3 border-t border-border">
                <button
                  onClick={handleViewAll}
                  className="w-full text-center text-sm text-primary hover:text-primary/80 font-medium py-2"
                >
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
