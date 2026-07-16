import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { formatRelativeTime } from '../../utils/dateUtils';

export default function TopBar({ title, onMenuClick, searchValue, onSearchChange, searchPlaceholder = 'Search your pantry...' }) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <header className="flex justify-between items-center h-16 px-lg md:ml-64 sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
      <div className="flex items-center gap-md">
        <button className="md:hidden p-xs" onClick={onMenuClick} aria-label="Open menu">
          <span className="material-symbols-outlined text-primary">menu</span>
        </button>
        {title && <h2 className="font-headline-md text-headline-md font-bold text-primary hidden sm:block">{title}</h2>}
        {onSearchChange && (
          <div className="relative hidden lg:block">
            <input
              className="bg-surface-container-low border border-outline-variant rounded-full px-xl py-xs w-64 focus:outline-none focus:ring-1 focus:ring-primary text-body-md"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-body-md">
              search
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-md">
        {/* Notifications */}
        <div className="relative">
          <button
            className="relative text-on-surface-variant hover:text-primary transition-opacity active:opacity-80"
            onClick={() => {
              setNotifOpen((o) => !o);
              setAccountOpen(false);
            }}
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-on-error text-[10px] rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-sm w-80 max-h-96 overflow-y-auto bg-surface border border-outline-variant rounded-xl shadow-lg z-40">
              <div className="flex items-center justify-between px-md py-sm border-b border-outline-variant">
                <span className="font-label-md text-primary">Notifications</span>
                <button className="text-label-sm text-secondary hover:underline" onClick={markAllAsRead}>
                  Mark all read
                </button>
              </div>
              {notifications.length === 0 ? (
                <p className="p-md text-label-sm text-on-surface-variant">No new notifications</p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`w-full text-left px-md py-sm border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors ${
                      !n.read ? 'bg-primary-fixed/20' : ''
                    }`}
                  >
                    <p className="font-label-md text-on-surface text-label-sm">{n.title}</p>
                    <p className="text-label-sm text-on-surface-variant">{n.message}</p>
                    <p className="text-label-sm text-outline mt-xs">{formatRelativeTime(n.createdAt)}</p>
                  </button>
                ))
              )}
              <Link
                to="/notifications"
                className="block text-center py-sm text-label-sm text-primary hover:bg-surface-container-low"
                onClick={() => setNotifOpen(false)}
              >
                View all
              </Link>
            </div>
          )}
        </div>

        {/* Account */}
        <div className="relative">
          <button
            className="flex items-center gap-sm cursor-pointer hover:text-primary transition-opacity active:opacity-80"
            onClick={() => {
              setAccountOpen((o) => !o);
              setNotifOpen(false);
            }}
          >
            <span className="material-symbols-outlined text-on-surface-variant">account_circle</span>
            <span className="hidden sm:inline font-label-md text-on-surface-variant">{user.fullName.split(' ')[0]}</span>
          </button>
          {accountOpen && (
            <div className="absolute right-0 mt-sm w-48 bg-surface border border-outline-variant rounded-xl shadow-lg z-40">
              <Link
                to="/settings"
                className="block px-md py-sm text-label-md hover:bg-surface-container-low"
                onClick={() => setAccountOpen(false)}
              >
                Settings
              </Link>
              <button
                className="w-full text-left px-md py-sm text-label-md text-error hover:bg-surface-container-low"
                onClick={logout}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
