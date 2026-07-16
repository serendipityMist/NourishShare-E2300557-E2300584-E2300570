const STYLES = {
  fresh: 'text-primary bg-primary/10 border-primary/20',
  expiring: 'text-secondary-fixed-dim bg-secondary/10 border-secondary/20',
  expired: 'text-error bg-error/10 border-error/20',
  claimed: 'text-on-surface-variant bg-surface-container border-outline-variant',
  available: 'text-primary bg-primary/10 border-primary/20',
  neutral: 'text-on-surface-variant bg-surface-container border-outline-variant',
};

const ICONS = {
  fresh: 'check_circle',
  expiring: 'warning',
  expired: 'error',
  claimed: 'check_circle',
  available: 'verified',
  neutral: null,
};

export default function Badge({ status = 'neutral', children, className = '' }) {
  const icon = ICONS[status];
  return (
    <div
      className={`inline-flex items-center gap-xs px-sm py-xs rounded font-label-md text-label-sm border ${STYLES[status]} ${className}`}
    >
      {icon && <span className="material-symbols-outlined text-[16px]">{icon}</span>}
      <span>{children}</span>
    </div>
  );
}
