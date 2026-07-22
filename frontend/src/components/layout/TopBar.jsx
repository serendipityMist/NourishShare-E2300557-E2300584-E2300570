import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { formatRelativeTime } from '../../utils/dateUtils';
import Avatar from '../ui/Avatar';

export default function TopBar({
  title,
  onMenuClick,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search your pantry...',
}) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  const [notifOpen, setNotifOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <header className="flex justify-between items-center h-16 px-lg md:ml-64 sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
      <div className="flex items-center gap-md">
        <button
          className="md:hidden p-xs"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined text-primary">
            menu
          </span>
        </button>

        {title && (
          <h2 className="font-headline-md text-headline-md font-bold text-primary hidden sm:block">
            {title}
          </h2>
        )}

        {onSearchChange && (
          <div className="relative hidden lg:block">
            <input
              className="bg-surface-container-low border border-outline-variant rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />

            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-5">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setAccountOpen(false);
            }}
            className="relative"
          >
            <span className="material-symbols-outlined text-3xl">
              notifications
            </span>

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-lg border z-50">
              <div className="flex justify-between items-center px-4 py-3 border-b">
                <h3 className="font-semibold">Notifications</h3>

                <button
                  className="text-sm text-primary"
                  onClick={markAllAsRead}
                >
                  Mark all read
                </button>
              </div>

              {notifications.length === 0 ? (
                <p className="p-4 text-sm">No notifications</p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b"
                  >
                    <p className="font-semibold">{n.title}</p>
                    <p>{n.message}</p>
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </button>
                ))
              )}

              <Link
                to="/notifications"
                onClick={() => setNotifOpen(false)}
                className="block text-center py-3 hover:bg-gray-100"
              >
                View all
              </Link>
            </div>
          )}
        </div>

        {/* Account */}
        <div className="relative">
          <button
            onClick={() => {
              setAccountOpen(!accountOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2"
          >
            <Avatar
              src={user?.avatar}
              name={user?.name}
              size={11}
            />

            <span className="hidden sm:block font-medium">
              {(user?.name || 'User').split(' ')[0]}
            </span>
          </button>

          {accountOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-lg border overflow-hidden z-50">
              <div className="flex items-center gap-3 p-4 border-b">
                <Avatar
                  src={user?.avatar}
                  name={user?.name}
                  size={14}
                />

                <div className="overflow-hidden">
                  <h4 className="font-semibold truncate">
                    {user?.name}
                  </h4>

                  <p className="text-sm text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              <Link
                to="/settings"
                onClick={() => setAccountOpen(false)}
                className="block px-4 py-3 hover:bg-gray-100"
              >
                Settings
              </Link>

              <button
                onClick={logout}
                className="w-full text-left px-4 py-3 text-red-600 hover:bg-gray-100"
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