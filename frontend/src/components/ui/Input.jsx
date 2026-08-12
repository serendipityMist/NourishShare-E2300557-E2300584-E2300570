export default function Input({ label, error, hint, id, className = '', variant = 'light', ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  // 'light' (default) = white text, for dark backgrounds like the auth pages.
  // 'dark' = black text, for light-background contexts like modals on cream/white surfaces.
  const isDark = variant === 'dark';
  const textColor = isDark ? 'text-black' : 'text-white';
  const placeholderColor = isDark ? 'placeholder:text-black/50' : 'placeholder:text-white/50';

  return (
    <div className={`flex flex-col gap-xs w-full ${textColor}`}>
      {label && (
        <label htmlFor={inputId} className={`${textColor} font-label-md text-label-md`}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`stamped-input ${textColor} py-sm font-body-md ${placeholderColor} w-full ${
          error ? 'border-error' : ''
        } ${className}`}
        {...props}
      />
      {hint && !error && <span className="text-label-sm font-label-sm text-outline">{hint}</span>}
      {error && <span data-testid="field-error" className="text-label-sm font-label-sm text-error">{error}</span>}
    </div>
  );
}