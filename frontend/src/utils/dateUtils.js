export function daysUntil(dateString) {
  if (!dateString) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function getExpiryStatus(dateString) {
  const days = daysUntil(dateString);
  if (days === null) return 'unknown';
  if (days < 0) return 'expired';
  if (days <= 3) return 'expiring';
  return 'fresh';
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-MY', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatRelativeTime(timestamp) {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
