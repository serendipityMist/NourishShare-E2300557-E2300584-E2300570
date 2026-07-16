const VARIANTS = {
  primary: 'bg-primary text-on-primary hover:opacity-90',
  secondary: 'bg-secondary-fixed text-on-secondary-fixed-variant hover:bg-secondary-fixed-dim',
  outline: 'border border-outline-variant text-primary hover:bg-surface-container',
  ghost: 'text-on-surface-variant hover:bg-surface-container',
  danger: 'bg-error text-on-error hover:opacity-90',
};

export default function Button({
  children,
  variant = 'primary',
  icon,
  className = '',
  type = 'button',
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-sm px-lg py-sm rounded-full font-label-md text-label-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
      {children}
    </button>
  );
}
