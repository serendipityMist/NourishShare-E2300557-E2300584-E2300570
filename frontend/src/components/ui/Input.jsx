export default function Input({ label, error, hint, id, className = '', ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-xs w-full">
      {label && (
        <label htmlFor={inputId} className="font-label-md text-label-md text-on-surface-variant">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`stamped-input py-sm font-body-md placeholder:opacity-30 w-full ${
          error ? 'border-error' : ''
        } ${className}`}
        {...props}
      />
      {hint && !error && <span className="text-label-sm font-label-sm text-outline">{hint}</span>}
      {error && <span className="text-label-sm font-label-sm text-error">{error}</span>}
    </div>
  );
}
