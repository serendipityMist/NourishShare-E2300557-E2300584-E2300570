import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout.jsx';
import DonationCard from '../../components/donations/DonationCard.jsx';
import MyListingCard from '../../components/donations/MyListingCard.jsx';
import CreateDonationModal from '../../components/donations/CreateDonationModal.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Button from '../../components/ui/Button.jsx';
import Select from '../../components/ui/Select.jsx';
import { useDonations } from '../../hooks/useDonations';
import { useInventory } from '../../hooks/useInventory';
import { useNotifications } from '../../hooks/useNotifications';
import { CATEGORIES, STORAGE_LOCATIONS } from '../../data/mockData';
import { daysUntil, getExpiryStatus, formatDate } from '../../utils/dateUtils';
import Badge from '../../components/ui/Badge.jsx';

const TABS = [
  { id: 'donations', label: 'Donation Listings' },
  { id: 'inventory', label: 'My Inventory' },
  { id: 'my-listings', label: 'My Listings' },
];

const EXPIRY_FILTERS = [
  { value: 'all', label: 'All Expiry Dates' },
  { value: 'fresh', label: 'Fresh' },
  { value: 'expiring', label: 'Expiring Soon' },
  { value: 'expired', label: 'Expired' },
];

export default function BrowseDonations() {
  const {
    donations,
    myDonations,
    claimDonation,
    updateDonation,
    removeDonation,
    fetchMyDonations,
  } = useDonations();
  const { activeItems } = useInventory();
  const { showToast, fetchNotifications } = useNotifications();
  const [tab, setTab] = useState('donations');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState(null);

  const [donationQuery, setDonationQuery] = useState('');
  const [donationCategory, setDonationCategory] = useState('all');
  const [donationLocation, setDonationLocation] = useState('');

  const [invQuery, setInvQuery] = useState('');
  const [invCategory, setInvCategory] = useState('all');
  const [invStorage, setInvStorage] = useState('all');
  const [invExpiry, setInvExpiry] = useState('all');

  const filteredDonations = useMemo(() => {
    return donations.filter((donation) => {
      const itemName = donation.itemName || donation.food?.name || '';
      const categoryName = donation.food?.category?.name || donation.category || '';
      const pickup = donation.pickUpLocation || donation.pickupLocation || '';

      const matchesQuery = !donationQuery.trim() || [itemName, pickup]
        .some((value) => value.toLowerCase().includes(donationQuery.trim().toLowerCase()));

      const matchesCategory =
        donationCategory === 'all' || categoryName === donationCategory;

      const matchesLocation =
        !donationLocation.trim() ||
        pickup.toLowerCase().includes(donationLocation.trim().toLowerCase());

      return matchesQuery && matchesCategory && matchesLocation;
    });
  }, [donations, donationQuery, donationCategory, donationLocation]);

  const filteredInventory = useMemo(() => {
    return activeItems.filter((item) => {
      const categoryName =
        typeof item.category === 'object' ? item.category?.name : item.category;

      const matchesQuery =
        !invQuery.trim() ||
        [item.name, categoryName, item.storageLocation]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(invQuery.trim().toLowerCase())
          );

      const matchesCategory =
        invCategory === 'all' || categoryName === invCategory;

      const matchesStorage =
        invStorage === 'all' || item.storageLocation === invStorage;

      const expiryStatus = getExpiryStatus(item.expiryDate);
      const matchesExpiry =
        invExpiry === 'all' || expiryStatus === invExpiry;

      return matchesQuery && matchesCategory && matchesStorage && matchesExpiry;
    });
  }, [activeItems, invQuery, invCategory, invStorage, invExpiry]);

  async function handleClaim(donation) {
    const donationId = donation._id || donation.id;
    try {
      await claimDonation(donationId);
      await fetchNotifications();
      const itemName = donation.itemName || donation.food?.name || 'Food item';
      showToast(`You claimed "${itemName}"! Confirmation saved to notifications.`, 'success');
    } catch (error) {
      showToast(
        error.message || 'Unable to claim this donation',
        'error'
      );
    }
  }

  async function handleEditDonation(formData) {
    if (!editingDonation) return;

    try {
      await updateDonation(editingDonation._id, formData);
      showToast('Donation listing updated successfully', 'success');
      setEditingDonation(null);
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to update listing', 'error');
    }
  }

  async function handleDeleteDonation(donation) {
    const itemName = donation.food?.name || 'this listing';
    if (!window.confirm(`Remove "${itemName}" from donation listings?`)) return;

    try {
      await removeDonation(donation._id);
      await fetchMyDonations();
      showToast('Donation listing removed', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to remove listing', 'error');
    }
  }

  return (
    <AppLayout title="Browse Food Items">
      <div className="max-w-[1200px] mx-auto w-full space-y-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary mb-xs">
            Browse Food Items
          </h2>
          <p className="font-body-md text-on-surface-variant">
            Filter by inventory or donation listings, category, expiry, storage, and location.
          </p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-12 gap-lg">
          <div className="md:col-span-8 bg-surface-container-low p-sm rounded-xl flex items-center gap-sm">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-md px-lg rounded-lg font-label-md transition-all ${
                  tab === t.id ? 'text-primary bg-surface font-bold shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="md:col-span-4 flex gap-md">
            {tab === 'donations' && (
              <Button icon="add" onClick={() => setCreateOpen(true)} className="whitespace-nowrap w-full">
                Create Listing
              </Button>
            )}
            {tab === 'inventory' && (
              <Link to="/inventory?add=1" className="w-full">
                <Button icon="add" className="w-full">Add Food Item</Button>
              </Link>
            )}
            {tab === 'my-listings' && (
              <Link to="/inventory" className="w-full">
                <Button icon="volunteer_activism" className="w-full">Convert from Inventory</Button>
              </Link>
            )}
          </div>
        </section>

        {tab === 'donations' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <input
                className="bg-surface-container-low border border-outline-variant rounded-full px-lg py-sm text-body-md focus:ring-1 focus:ring-primary"
                placeholder="Search by item name..."
                value={donationQuery}
                onChange={(e) => setDonationQuery(e.target.value)}
              />
              <Select
                value={donationCategory}
                onChange={(e) => setDonationCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
              <input
                className="bg-surface-container-low border border-outline-variant rounded-full px-lg py-sm text-body-md focus:ring-1 focus:ring-primary"
                placeholder="Filter by pickup location..."
                value={donationLocation}
                onChange={(e) => setDonationLocation(e.target.value)}
              />
            </div>

            {filteredDonations.length === 0 ? (
              <EmptyState
                icon="search_off"
                title="No items found"
                message="No items found. Please adjust your filters."
              />
            ) : (
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                {filteredDonations.map((donation) => {
                  const donationId = donation._id || donation.id;
                  return (
                    <DonationCard key={donationId} donation={donation} onClaim={handleClaim} />
                  );
                })}
              </section>
            )}
          </>
        )}

        {tab === 'inventory' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
              <input
                className="bg-surface-container-low border border-outline-variant rounded-full px-lg py-sm text-body-md focus:ring-1 focus:ring-primary"
                placeholder="Search your inventory..."
                value={invQuery}
                onChange={(e) => setInvQuery(e.target.value)}
              />
              <Select value={invCategory} onChange={(e) => setInvCategory(e.target.value)}>
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
              <Select value={invStorage} onChange={(e) => setInvStorage(e.target.value)}>
                <option value="all">All Storage Types</option>
                {STORAGE_LOCATIONS.map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </Select>
              <Select value={invExpiry} onChange={(e) => setInvExpiry(e.target.value)}>
                {EXPIRY_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>{filter.label}</option>
                ))}
              </Select>
            </div>

            {filteredInventory.length === 0 ? (
              <EmptyState
                icon="inventory_2"
                title="No items found"
                message="No items found. Please adjust your filters."
                action={
                  <Link to="/inventory?add=1">
                    <Button icon="add">Add Food Item</Button>
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                {filteredInventory.map((item) => {
                  const status = getExpiryStatus(item.expiryDate);
                  const categoryName =
                    typeof item.category === 'object' ? item.category?.name : item.category;

                  return (
                    <div
                      key={item._id}
                      className="bg-surface border border-outline-variant rounded-xl overflow-hidden editorial-shadow flex flex-col"
                    >
                      <Link to={`/inventory/${item._id}`} className="flex-1">
                        <div className="h-40 overflow-hidden">
                          <img
                            src={item.foodImage || 'https://via.placeholder.com/400x300?text=No+Image'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-md flex-1 flex flex-col gap-xs">
                          <div className="flex justify-between items-start">
                            <h4 className="font-label-md text-primary">{item.name}</h4>
                            <Badge status={status}>
                              {status === 'fresh' ? 'Fresh' : status === 'expiring' ? 'Expiring' : 'Expired'}
                            </Badge>
                          </div>
                          <p className="text-label-sm text-on-surface-variant">
                            {categoryName} • {item.quantity?.number} {item.quantity?.units}
                          </p>
                          <p className="text-label-sm text-on-surface-variant">
                            {item.storageLocation} • Best before {formatDate(item.expiryDate)}
                          </p>
                        </div>
                      </Link>
                      <div className="p-md pt-0 flex gap-sm">
                        <Link to={`/inventory/${item._id}`} className="flex-1">
                          <Button variant="outline" className="w-full" icon="restaurant">
                            Manage
                          </Button>
                        </Link>
                        <Link to={`/inventory/${item._id}?donate=1`} className="flex-1">
                          <Button className="w-full" icon="volunteer_activism">
                            Donate
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === 'my-listings' && (
          <>
            {myDonations.length === 0 ? (
              <EmptyState
                icon="volunteer_activism"
                title="No donation listings yet"
                message="Convert an inventory item to a donation listing to share surplus food."
                action={
                  <Link to="/inventory">
                    <Button icon="inventory_2">Go to Inventory</Button>
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg items-stretch">
                {myDonations.map((donation) => (
                  <MyListingCard
                    key={donation._id}
                    donation={donation}
                    onEdit={setEditingDonation}
                    onRemove={handleDeleteDonation}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <CreateDonationModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={() => {
          showToast('Select a food item from your inventory to create a donation listing.', 'info');
          setCreateOpen(false);
        }}
      />

      <CreateDonationModal
        open={Boolean(editingDonation)}
        onClose={() => setEditingDonation(null)}
        onCreate={handleEditDonation}
        initialValues={{
          pickUpLocation: editingDonation?.pickUpLocation || '',
          availabilityTime: editingDonation?.availabilityTime || '',
        }}
        title="Edit Donation Listing"
        submitLabel="Save Changes"
      />
    </AppLayout>
  );
}
