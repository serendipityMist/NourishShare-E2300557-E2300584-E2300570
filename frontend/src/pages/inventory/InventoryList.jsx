import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout.jsx';
import InventoryRow from '../../components/inventory/InventoryRow.jsx';
import AddEditItemModal from '../../components/inventory/AddEditItemModal.jsx';
import ConfirmDeleteModal from '../../components/inventory/ConfirmDeleteModal.jsx';
import CreateDonationModal from '../../components/donations/CreateDonationModal.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Button from '../../components/ui/Button.jsx';
import { useInventory } from '../../hooks/useInventory';
import { useDonations } from '../../hooks/useDonations';
import { useNotifications } from '../../hooks/useNotifications';
import { useFilters } from '../../hooks/useFilters';
import { getExpiryStatus, daysUntil } from '../../utils/dateUtils';

const STORAGE_FILTERS = ['all', 'Refrigerator', 'Freezer', 'Main Pantry', 'Countertop', 'Spice Rack'];

export default function InventoryList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeItems, addItem, updateItem, deleteItem, markAsUsed } = useInventory();
  const { createDonation } = useDonations();
  const { showToast } = useNotifications();

  const { query, setQuery, filters, setFilter, filteredItems } = useFilters(activeItems, {
    searchKeys: ['name', 'category'],
    initialFilters: { storageLocation: 'all' },
    sortFns: {
      expiry: (a, b) => (daysUntil(a.expiryDate) ?? 0) - (daysUntil(b.expiryDate) ?? 0),
      name: (a, b) => a.name.localeCompare(b.name),
      quantity: (a, b) => a.quantity - b.quantity,
    },
    initialSort: 'expiry',
  });

  const [addEditOpen, setAddEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [donatingItem, setDonatingItem] = useState(null);

  // Support ?add=1 deep link from sidebar / dashboard CTA
  useEffect(() => {
    if (searchParams.get('add') === '1') {
      setEditingItem(null);
      setAddEditOpen(true);
      searchParams.delete('add');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSave(formData) {
    if (editingItem) {
      updateItem(editingItem.id, formData);
      showToast('Item updated', 'success');
    } else {
      addItem(formData);
      showToast('Item added to your pantry', 'success');
    }
  }

  function handleConvertToDonation(donationForm) {
    createDonation(donationForm);
    if (donatingItem) {
      markAsUsed(donatingItem.id); // remove from active inventory since it's now listed
    }
    showToast('Listing published to Donations', 'success');
  }

  return (
    <AppLayout
      title="Inventory"
      searchValue={query}
      onSearchChange={setQuery}
      searchPlaceholder="Search pantry..."
    >
      <div className="space-y-lg">
        <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-md bg-surface-container-low p-md rounded-xl border border-outline-variant sticker-shadow">
          <div className="flex flex-wrap items-center gap-sm">
            <span className="font-label-md text-on-surface-variant mr-xs">Filter:</span>
            {STORAGE_FILTERS.map((loc) => (
              <button
                key={loc}
                onClick={() => setFilter('storageLocation', loc)}
                className={`px-md py-xs rounded-full font-label-md border transition-all ${
                  filters.storageLocation === loc
                    ? 'bg-secondary-fixed text-on-secondary-fixed-variant border-secondary'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant hover:border-primary'
                }`}
              >
                {loc === 'all' ? 'All Items' : loc}
              </button>
            ))}
          </div>
          <Button
            icon="add"
            onClick={() => {
              setEditingItem(null);
              setAddEditOpen(true);
            }}
          >
            Add Food Item
          </Button>
        </section>

        {filteredItems.length === 0 ? (
          <EmptyState
            icon="inventory_2"
            title="No items found"
            message="Please adjust your filters, or add a new item to your pantry."
            action={
              <Button
                icon="add"
                onClick={() => {
                  setEditingItem(null);
                  setAddEditOpen(true);
                }}
              >
                Add Food Item
              </Button>
            }
          />
        ) : (
          <div className="bg-white rounded-xl border border-outline-variant overflow-hidden sticker-shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[720px]">
                <thead className="bg-surface-container-high border-b border-outline-variant">
                  <tr>
                    <th className="px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider">Item Details</th>
                    <th className="px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider">Location</th>
                    <th className="px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider">Quantity</th>
                    <th className="px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider">Expiry</th>
                    <th className="px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                    <th className="px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {filteredItems.map((item) => (
                    <InventoryRow
                      key={item.id}
                      item={item}
                      onEdit={(i) => {
                        setEditingItem(i);
                        setAddEditOpen(true);
                      }}
                      onDelete={setDeletingItem}
                      onMarkUsed={(i) => {
                        markAsUsed(i.id);
                        showToast(`${i.name} marked as used`, 'success');
                      }}
                      onConvertToDonation={setDonatingItem}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-surface-container-low px-lg py-md border-t border-outline-variant flex items-center justify-between">
              <p className="font-label-sm text-on-surface-variant">
                Showing {filteredItems.length} of {activeItems.length} items in your pantry
              </p>
            </div>
          </div>
        )}
      </div>

      <AddEditItemModal
        open={addEditOpen}
        onClose={() => setAddEditOpen(false)}
        onSave={handleSave}
        initialItem={editingItem}
      />
      <ConfirmDeleteModal
        open={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={() => {
          deleteItem(deletingItem.id);
          showToast(`${deletingItem.name} removed`, 'info');
        }}
        itemName={deletingItem?.name}
      />
      <CreateDonationModal
        open={Boolean(donatingItem)}
        onClose={() => setDonatingItem(null)}
        onCreate={handleConvertToDonation}
        fromInventoryItem={donatingItem}
      />
    </AppLayout>
  );
}
