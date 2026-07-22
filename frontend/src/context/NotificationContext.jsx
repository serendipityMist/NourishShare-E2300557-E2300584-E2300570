import { createContext, useCallback, useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';

export const NotificationContext = createContext(null);

let toastCounter = 1;

function mapNotification(notification) {
  return {
    id: notification._id,
    type: notification.notificationType?.toLowerCase() || 'account',
    title: notification.title,
    message: notification.description,
    read: notification.isRead,
    createdAt: new Date(notification.createdAt).getTime(),
  };
}

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    try {
      const res = await notificationService.getMyNotifications();
      const list = res.data?.data?.notifications || [];
      setNotifications(list.map(mapNotification));
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [
      {
        id: `local-${Date.now()}`,
        read: false,
        createdAt: Date.now(),
        ...notification,
      },
      ...prev,
    ]);
  }, []);

  const markAsRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    if (String(id).startsWith('local-')) return;

    try {
      await notificationService.markAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  const showToast = useCallback((message, variant = 'success') => {
    const toastId = toastCounter++;
    setToasts((prev) => [...prev, { id: toastId, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 3000);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    toasts,
    showToast,
    fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
