export default function EmptyState({ icon = 'inventory_2', title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-xl px-lg bg-surface-container-low border border-dashed border-outline-variant rounded-xl">
      <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center mb-md text-primary">
        <span className="material-symbols-outlined text-[32px]">{icon}</span>
      </div>
      <h3 className="font-headline-md text-headline-md text-primary mb-xs">{title}</h3>
      {message && <p className="font-body-md text-on-surface-variant max-w-md mb-md">{message}</p>}
      {action}
    </div>
  );
}
