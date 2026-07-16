import { useEffect } from 'react';

export default function Modal({ open, onClose, title, subtitle, children, footer, maxWidth = 'max-w-2xl' }) {
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') onClose?.();
    }
    if (open) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-gutter overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={`modal-enter w-full ${maxWidth} bg-surface rounded-xl border border-outline-variant shadow-lg flex flex-col overflow-hidden max-h-[90vh]`}
      >
        {(title || onClose) && (
          <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low shrink-0">
            <div>
              {title && <h2 className="font-headline-md text-headline-md text-primary">{title}</h2>}
              {subtitle && <p className="text-label-sm text-on-surface-variant">{subtitle}</p>}
            </div>
            {onClose && (
              <button
                className="p-xs hover:bg-surface-container-high rounded-full transition-colors"
                onClick={onClose}
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            )}
          </div>
        )}
        <div className="overflow-y-auto paper-texture">{children}</div>
        {footer && (
          <div className="px-lg py-md border-t border-outline-variant bg-surface-container-low flex items-center justify-end gap-md shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
