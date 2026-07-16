import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import AddEditItemModal from '../../components/inventory/AddEditItemModal.jsx';
import ConfirmDeleteModal from '../../components/inventory/ConfirmDeleteModal.jsx';
import CreateDonationModal from '../../components/donations/CreateDonationModal.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { useInventory } from '../../hooks/useInventory';
import { useDonations } from '../../hooks/useDonations';
import { useNotifications } from '../../hooks/useNotifications';
import { daysUntil, formatDate, getExpiryStatus } from '../../utils/dateUtils';

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getItemById, updateItem, deleteItem, markAsUsed } = useInventory();
  const { createDonation } = useDonations();
  const { showToast } = useNotifications();

  const item = getItemById(id);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);

  if (!item) {
    return (
      <AppLayout title="Item Details">
        <EmptyState
          icon="search_off"
          title="Item not found"
          message="This pantry item may have been removed."
          action={
            <Link to="/inventory">
              <Button>Back to Inventory</Button>
            </Link>
          }
        />
      </AppLayout>
    );
  }

  const status = getExpiryStatus(item.expiryDate);
  const days = daysUntil(item.expiryDate);

  return (
    <AppLayout title="Item Details">
      <div className="flex items-center gap-sm mb-lg">
        <Link to="/inventory" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">
          arrow_back
        </Link>
        <span className="font-label-md text-primary">Back to Inventory</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between md:items-end gap-md mb-xl">
        <div>
          <div className="flex items-center gap-sm mb-xs">
            <span className="bg-primary-fixed text-on-primary-fixed-variant px-sm py-xs text-[10px] uppercase font-bold tracking-widest rounded-sm border border-outline-variant">
              {item.status === 'used' ? 'Used' : item.status === 'donated' ? 'Donated' : 'Pantry Essential'}
            </span>
            <span className="text-on-surface-variant font-label-md">{item.category}</span>
          </div>
          <h2 className="font-headline-xl text-headline-xl text-primary">{item.name}</h2>
          <p className="text-on-surface-variant font-body-md flex items-center gap-xs">
            <span className="material-symbols-outlined text-sm">location_on</span> {item.storageLocation}
          </p>
        </div>
        <div className="flex gap-md flex-wrap">
          <Button variant="outline" icon="restaurant" onClick={() => { markAsUsed(item.id); showToast(`${item.name} marked as used`, 'success'); }}>
            Mark as Used
          </Button>
          <Button variant="outline" icon="edit" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button icon="volunteer_activism" onClick={() => setDonateOpen(true)}>
            List for Donation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-xl mb-xl">
        <div className="col-span-12 lg:col-span-7">
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-surface-container relative">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            {item.notes && (
              <div className="absolute bottom-md left-md bg-surface/90 backdrop-blur-sm p-md rounded-lg border border-outline-variant shadow-sm max-w-xs">
                <p className="text-on-surface-variant font-label-sm uppercase tracking-tighter mb-xs">Notes</p>
                <p className="text-body-md leading-snug">{item.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 flex flex-col gap-lg">
          <div className="bg-surface-container-low p-lg border border-outline-variant relative overflow-hidden">
            <div className="flex justify-between items-center mb-md relative z-10">
              <h3 className="font-label-md text-on-surface-variant">EXPIRY STATUS</h3>
              <Badge status={status}>
                {days < 0 ? `Expired ${Math.abs(days)}d ago` : days === 0 ? 'Expires today' : `${days} days left`}
              </Badge>
            </div>
            <div className="h-3 w-full bg-surface-variant rounded-full overflow-hidden relative z-10">
              <div
                className={`h-full rounded-full ${status === 'expired' ? 'bg-error' : status === 'expiring' ? 'bg-secondary' : 'bg-primary'}`}
                style={{ width: `${Math.max(5, Math.min(100, 100 - (days ?? 0)))}%` }}
              />
            </div>
            <div className="flex justify-between mt-sm text-on-surface-variant font-label-sm relative z-10">
              <span>Expires: {formatDate(item.expiryDate)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="p-md border border-outline-variant bg-surface">
              <p className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-xs">Quantity</p>
              <p className="font-headline-md text-on-surface">
                {item.quantity} {item.unit}
              </p>
            </div>
            <div className="p-md border border-outline-variant bg-surface">
              <p className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-xs">Category</p>
              <p className="font-headline-md text-on-surface">{item.category}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-xl pt-lg border-t border-outline-variant flex justify-end">
        <button
          className="flex items-center gap-xs px-md py-sm text-error font-bold text-label-md hover:bg-error-container/20 transition-colors rounded-lg"
          onClick={() => setDeleteOpen(true)}
        >
          <span className="material-symbols-outlined">delete</span> Remove from Pantry
        </button>
      </div>

      <AddEditItemModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={(formData) => {
          updateItem(item.id, formData);
          showToast('Item updated', 'success');
        }}
        initialItem={item}
      />
      <ConfirmDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          deleteItem(item.id);
          showToast(`${item.name} removed`, 'info');
          navigate('/inventory');
        }}
        itemName={item.name}
      />
      <CreateDonationModal
        open={donateOpen}
        onClose={() => setDonateOpen(false)}
        onCreate={(formData) => {
          createDonation(formData);
          markAsUsed(item.id);
          showToast('Listing published to Donations', 'success');
          navigate('/donations');
        }}
        fromInventoryItem={item}
      />
    </AppLayout>
  );
}
