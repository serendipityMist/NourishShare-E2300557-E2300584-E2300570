export default function Select({ label, id, className = '', children, ...props }) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-xs w-full">
      {label && (
        <label htmlFor={selectId} className="font-label-md text-label-md text-on-surface-variant">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full appearance-none stamped-input py-sm pr-xl font-body-md cursor-pointer ${className}`}
          {...props}
        >
          {children}
        </select>
        <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
          expand_more
        </span>
      </div>
    </div>
  );
}
