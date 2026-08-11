export default function Input({ label, error, hint, id, className = '', ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-xs w-full text-white">
      {label && (
        <label htmlFor={inputId} className="text-white font-label-md text-label-md">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`stamped-input text-white py-sm font-body-md placeholder:text-white/50 w-full ${
          error ? 'border-error' : ''
        } ${className}`}
        {...props}
      />
      {hint && !error && <span className="text-label-sm font-label-sm text-outline">{hint}</span>}
      {error && <span data-testid="field-error" className="text-label-sm font-label-sm text-error">{error}</span>}
    </div>
  );
}