import AppLayout from '../components/layout/AppLayout.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { useNotifications } from '../hooks/useNotifications';
import { formatRelativeTime } from '../utils/dateUtils';

const ICONS = {
  expiry: 'warning',
  donation: 'volunteer_activism',
  account: 'account_circle',
  meal: 'calendar_month',
};

export default function Notifications() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  return (
    <AppLayout title="Notifications">
      <div className="flex items-center justify-between mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary mb-xs">Notifications</h2>
          <p className="font-body-md text-on-surface-variant">Expiry alerts, donation updates, and account activity.</p>
        </div>
        <button className="text-label-md text-primary hover:underline" onClick={markAllAsRead}>
          Mark all as read
        </button>
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon="notifications_off" title="No new notifications" message="You're all caught up." />
      ) : (
        <div className="bg-white border border-outline-variant rounded-xl divide-y divide-outline-variant/50">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`w-full text-left flex items-start gap-md p-lg hover:bg-surface-container-low transition-colors ${
                !n.read ? 'bg-primary-fixed/10' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined">{ICONS[n.type] || 'notifications'}</span>
              </div>
              <div className="flex-1">
                <p className="font-label-md text-on-surface">{n.title}</p>
                <p className="text-label-md text-on-surface-variant">{n.message}</p>
                <p className="text-label-sm text-outline mt-xs">{formatRelativeTime(n.createdAt)}</p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full bg-secondary mt-xs shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
