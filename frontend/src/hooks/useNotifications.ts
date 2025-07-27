import { useState, useEffect, useCallback } from 'react';
import { api, Notification } from '../lib/api';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecentNotifications = useCallback(async () => {
    try {
      const data = await api.getRecentNotifications();
      setRecentNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (err: any) {
      console.error('Failed to fetch recent notifications:', err);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setRecentNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.markAllNotificationsAsRead();
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setRecentNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  useEffect(() => {
    fetchRecentNotifications();
  }, [fetchRecentNotifications]);

  return {
    notifications,
    recentNotifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    fetchRecentNotifications,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
};
