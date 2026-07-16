import { useNotifications } from '../../hooks/useNotifications';

const VARIANT_STYLES = {
  success: 'bg-tertiary-container text-on-tertiary-container',
  error: 'bg-error text-on-error',
  info: 'bg-inverse-surface text-inverse-on-surface',
};

const VARIANT_ICONS = {
  success: 'check_circle',
  error: 'error',
  info: 'info',
};

export default function ToastStack() {
  const { toasts } = useNotifications();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-lg left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-sm items-center">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-lg py-md rounded-full font-label-md text-label-md shadow-lg flex items-center gap-sm animate-[modalEnter_0.3s_ease-out] ${VARIANT_STYLES[toast.variant]}`}
        >
          <span className="material-symbols-outlined text-[18px]">{VARIANT_ICONS[toast.variant]}</span>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
