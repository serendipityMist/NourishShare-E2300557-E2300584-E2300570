import { useState } from 'react';
import Button from '../ui/Button.jsx';

export default function ConfirmDeleteModal({ open, onClose, onConfirm, itemName }) {
  const [deleting, setDeleting] = useState(false);

  if (!open) return null;

  function handleConfirm() {
    setDeleting(true);
    setTimeout(() => {
      setDeleting(false);
      onConfirm();
      onClose();
    }, 600);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-md bg-on-surface/40 backdrop-blur-sm">
      <div className="modal-enter paper-texture w-full max-w-md bg-surface rounded-xl overflow-hidden shadow-xl border border-outline-variant relative">
        <div className="h-32 bg-error-container/30 flex items-center justify-center relative">
          <div className="bg-white p-md rounded-full shadow-sm border border-error/20">
            <span className="material-symbols-outlined text-error text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              delete_forever
            </span>
          </div>
        </div>
        <div className="p-lg flex flex-col gap-md text-center">
          <div className="space-y-sm">
            <h2 className="font-headline-md text-headline-md text-on-surface">Delete Pantry Item?</h2>
            <p className="font-body-md text-on-surface-variant">
              You are about to remove <span className="font-bold text-on-surface">&quot;{itemName}&quot;</span> from
              your digital inventory.
            </p>
          </div>
          <div className="bg-surface-container-low border-l-4 border-error p-md text-left flex gap-sm items-start rounded-r-lg">
            <span className="material-symbols-outlined text-error mt-0.5">warning</span>
            <div className="flex flex-col">
              <span className="font-label-md text-error">Permanent Action</span>
              <p className="font-body-md text-on-surface-variant text-sm">
                This item and its history will be lost forever. This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-md mt-md">
            <Button variant="outline" onClick={onClose}>
              Nevermind
            </Button>
            <Button variant="danger" onClick={handleConfirm} disabled={deleting} icon="delete">
              {deleting ? 'Deleting...' : 'Delete Item'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
