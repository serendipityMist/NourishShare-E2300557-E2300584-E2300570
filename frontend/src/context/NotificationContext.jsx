import { createContext, useCallback, useState } from 'react';

export const NotificationContext = createContext(null);

let idCounter = 1;

const INITIAL_NOTIFICATIONS = [
  {
    id: idCounter++,
    type: 'expiry',
    title: 'Farmhouse Milk is expiring soon',
    message: 'Expires in 2 days. Consider using it or listing it for donation.',
    read: false,
    createdAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: idCounter++,
    type: 'donation',
    title: 'Your listing was claimed',
    message: '"Bird\'s Eye Chilies" was claimed by a neighbor.',
    read: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
  },
  {
    id: idCounter++,
    type: 'account',
    title: 'Welcome to SavePlate',
    message: 'Your account was created successfully.',
    read: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
];

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [toasts, setToasts] = useState([]);

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [
      { id: idCounter++, read: false, createdAt: Date.now(), ...notification },
      ...prev,
    ]);
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const showToast = useCallback((message, variant = 'success') => {
    const toastId = idCounter++;
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
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
