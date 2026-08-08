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

import {
  daysUntil,
} from '../../utils/dateUtils';

const STORAGE_FILTERS = [
  'all',
  'Refrigerator',
  'Freezer',
  'Pantry',
];

export default function InventoryList() {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const {
    items,
    activeItems,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    markAsUsed,
    markItemAsDonated,
    fetchItems,
  } = useInventory();

  const {
    createDonation,
  } = useDonations();

  const {
    showToast,
  } = useNotifications();

  const {
    query,
    setQuery,
    filters,
    setFilter,
    filteredItems,
  } = useFilters(
    activeItems,
    {
      searchKeys: [
        'name',
      ],

      initialFilters: {
        storageLocation:
          'all',
      },

      sortFns: {
        expiry: (a, b) =>
          (daysUntil(
            a.expiryDate
          ) ?? 0) -
          (daysUntil(
            b.expiryDate
          ) ?? 0),

        name: (a, b) =>
          a.name.localeCompare(
            b.name
          ),

        quantity: (a, b) =>
          (a.quantity?.number || 0) -
          (b.quantity?.number || 0),
      },

      initialSort:
        'expiry',
    }
  );

  const [
    addEditOpen,
    setAddEditOpen,
  ] = useState(false);

  const [
    editingItem,
    setEditingItem,
  ] = useState(null);

  const [
    deletingItem,
    setDeletingItem,
  ] = useState(null);

  const [
    donatingItem,
    setDonatingItem,
  ] = useState(null);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  // ==========================================
  // Deep link ?add=1
  // ==========================================
  useEffect(() => {
    if (
      searchParams.get('add') === '1'
    ) {
      setEditingItem(null);
      setAddEditOpen(true);

      searchParams.delete('add');

      setSearchParams(
        searchParams,
        {
          replace: true,
        }
      );
    }
  }, [
    searchParams,
    setSearchParams,
  ]);

  // ==========================================
  // Save Food
  // ==========================================
  async function handleSave(formData) {
    try {
      if (editingItem) {
        await updateItem(editingItem._id, formData);
        await fetchItems();

        showToast(
          'Item updated successfully',
          'success'
        );
      } else {
        await addItem(formData);
        await fetchItems();

        showToast(
          'Item added to your pantry',
          'success'
        );
      }
    } catch (error) {
      showToast(
        error.message || 'Failed to save item',
        'error'
      );

      throw error;
    }
  }

  // ==========================================
  // Delete Food
  // ==========================================
  async function handleDelete() {
    if (!deletingItem) return;

    try {
      setDeleting(true);

      await deleteItem(
        deletingItem._id
      );

      showToast(
        `${deletingItem.name} removed`,
        'info'
      );

      setDeletingItem(null);
    } catch (error) {
      showToast(
        error.message ||
        'Failed to delete item',
        'error'
      );
    } finally {
      setDeleting(false);
    }
  }

  // ==========================================
  // Mark Used
  // ==========================================
  async function handleMarkUsed(item) {
    try {
      await markAsUsed(item._id);

      showToast(
        `${item.name} marked as used`,
        'success'
      );

      // Refresh inventory from backend
      await fetchItems();

    } catch (error) {
      showToast(
        error.message ||
        'Failed to mark item as used',
        'error'
      );
    }
  }

  // ==========================================
  // Convert to Donation (via API)
  // ==========================================
  async function handleConvertToDonation(
    donationForm
  ) {
    try {
      // donationForm = { pickUpLocation, availabilityTime }
      await createDonation(
        donatingItem._id,
        donationForm
      );

      showToast(
        'Listing published to Donations',
        'success'
      );

      markItemAsDonated(donatingItem._id);
      await fetchItems();
      setDonatingItem(null);
    } catch (error) {
      showToast(
        error.message ||
        'Failed to create donation',
        'error'
      );
    }
  }

  return (
    <AppLayout
      title="Inventory"
      searchValue={query}
      onSearchChange={setQuery}
      searchPlaceholder="Search pantry..."
    >
      <div className="space-y-lg">

        {/* Filter Bar */}
        <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-md bg-surface-container-low p-md rounded-xl border border-outline-variant sticker-shadow">
          <div className="flex flex-wrap items-center gap-sm">
            <span className="font-label-md text-on-surface-variant mr-xs">
              Filter:
            </span>

            {STORAGE_FILTERS.map(
              (location) => (
                <button
                  key={location}
                  onClick={() =>
                    setFilter(
                      'storageLocation',
                      location
                    )
                  }
                  className={`px-md py-xs rounded-full font-label-md border transition-all ${filters.storageLocation ===
                    location
                    ? 'bg-secondary-fixed text-on-secondary-fixed-variant border-secondary'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant hover:border-primary'
                    }`}
                >
                  {location ===
                    'all'
                    ? 'All Items'
                    : location}
                </button>
              )
            )}
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

        {/* Loading */}
        {loading && (
          <div className="py-xl text-center">
            <p>
              Loading your inventory...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-lg bg-error-container text-error rounded-lg">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          filteredItems.length ===
          0 ? (
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
          !loading &&
          !error && (
            <div className="bg-white rounded-xl border border-outline-variant overflow-hidden sticker-shadow">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[720px]">
                  <thead className="bg-surface-container-high border-b border-outline-variant">
                    <tr>
                      <th className="px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider">
                        Item Details
                      </th>

                      <th className="px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider">
                        Location
                      </th>

                      <th className="px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider">
                        Quantity
                      </th>

                      <th className="px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider">
                        Expiry
                      </th>

                      <th className="px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider">
                        Status
                      </th>

                      <th className="px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  {console.log("ACTIVE ITEMS:", activeItems.length)}
                  {console.log("FILTERED ITEMS:", filteredItems.length)}
                  {console.log(
                    filteredItems.map(item => ({
                      name: item.name,
                      status: item.status,
                      storage: item.storageLocation
                    }))
                  )}
                  <tbody className="divide-y divide-outline-variant/30">
                    {filteredItems.map(
                      (item) => (
                        <InventoryRow
                          key={item._id}
                          item={item}
                          onEdit={(selectedItem) => {
                            setEditingItem(selectedItem);
                            setAddEditOpen(true);
                          }}
                          onDelete={setDeletingItem}
                          onMarkUsed={handleMarkUsed}
                          onConvertToDonation={setDonatingItem}
                        />
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-surface-container-low px-lg py-md border-t border-outline-variant">
                <p className="font-label-sm text-on-surface-variant">
                  Showing{' '}
                  {filteredItems.length}{' '}
                  of{' '}
                  {items.length}{' '}
                  items in your pantry
                </p>
              </div>
            </div>
          )
        )}
      </div>

      {/* Add/Edit */}
      <AddEditItemModal
        open={addEditOpen}
        onClose={() =>
          setAddEditOpen(false)
        }
        onSave={handleSave}
        initialItem={
          editingItem
        }
      />

      {/* Delete */}
      <ConfirmDeleteModal
        open={Boolean(
          deletingItem
        )}
        onClose={() =>
          setDeletingItem(null)
        }
        onConfirm={
          handleDelete
        }
        deleting={deleting}
        itemName={
          deletingItem?.name
        }
      />

      {/* Donation */}
      <CreateDonationModal
        open={Boolean(
          donatingItem
        )}
        onClose={() =>
          setDonatingItem(null)
        }
        onCreate={
          handleConvertToDonation
        }
        fromInventoryItem={
          donatingItem
        }
      />
    </AppLayout>
  );
}
