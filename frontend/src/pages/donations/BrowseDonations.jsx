import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout.jsx';
import DonationCard from '../../components/donations/DonationCard.jsx';
import CreateDonationModal from '../../components/donations/CreateDonationModal.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Button from '../../components/ui/Button.jsx';
import Select from '../../components/ui/Select.jsx';
import { useDonations } from '../../hooks/useDonations';
import { useInventory } from '../../hooks/useInventory';
import { useNotifications } from '../../hooks/useNotifications';
import { useFilters } from '../../hooks/useFilters';
import { CATEGORIES } from '../../data/mockData';
import { daysUntil, getExpiryStatus, formatDate } from '../../utils/dateUtils';
import Badge from '../../components/ui/Badge.jsx';
import { Link } from 'react-router-dom';

const TABS = [
  { id: 'donations', label: 'Browse Donations' },
  { id: 'inventory', label: 'My Inventory' },
];

export default function BrowseDonations() {
  const { donations, claimDonation, createDonation } = useDonations();
  const { activeItems } = useInventory();
  const { showToast } = useNotifications();
  const [tab, setTab] = useState('donations');
  const [createOpen, setCreateOpen] = useState(false);

  const {
    query: donationQuery,
    setQuery: setDonationQuery,
    filters: donationFilters,
    setFilter: setDonationFilter,
    filteredItems: filteredDonations,
  } = useFilters(donations, {
    searchKeys: ['itemName', 'category', 'pickupLocation'],
    initialFilters: { category: 'all' },
  });

  const {
    query: invQuery,
    setQuery: setInvQuery,
    filters: invFilters,
    setFilter: setInvFilter,
    filteredItems: filteredInventory,
  } = useFilters(activeItems, {
    searchKeys: ['name', 'category', 'storageLocation'],
    initialFilters: { category: 'all' },
  });

  function handleClaim(donation) {
    claimDonation(donation.id);
    showToast(`You claimed "${donation.itemName}"! The donor has been notified.`, 'success');
  }

  return (
    <AppLayout title="Browse Food Items">
      <div className="max-w-[1200px] mx-auto w-full space-y-lg">
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
              <Select
                value={donationFilters.category}
                onChange={(e) => setDonationFilter('category', e.target.value)}
                className="!py-md"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="Cooked Meals">Cooked Meals</option>
              </Select>
            )}
            {tab === 'donations' && (
              <Button icon="add" onClick={() => setCreateOpen(true)} className="whitespace-nowrap">
                Create Listing
              </Button>
            )}
          </div>
        </section>

        {tab === 'donations' && (
          <>
            <input
              className="w-full md:w-80 bg-surface-container-low border border-outline-variant rounded-full px-lg py-sm text-body-md focus:ring-1 focus:ring-primary"
              placeholder="Search donations by name or location..."
              value={donationQuery}
              onChange={(e) => setDonationQuery(e.target.value)}
            />
            {filteredDonations.length === 0 ? (
              <EmptyState
                icon="search_off"
                title="No items found"
                message="Please adjust your filters, or check back again soon for new listings."
              />
            ) : (
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                {filteredDonations.map((donation) => (
                  <DonationCard key={donation.id} donation={donation} onClaim={handleClaim} />
                ))}
                <button
                  onClick={() => setCreateOpen(true)}
                  className="group bg-primary-fixed border border-primary text-primary rounded-xl overflow-hidden editorial-shadow flex flex-col items-center justify-center p-xl cursor-pointer transition-all hover:bg-primary-fixed-dim"
                >
                  <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[32px]">add</span>
                  </div>
                  <h3 className="font-headline-md text-center">Have surplus to share?</h3>
                  <p className="text-center text-label-md mt-sm opacity-80">
                    Help your neighbors and reduce food waste by creating a new listing.
                  </p>
                </button>
              </section>
            )}
          </>
        )}

        {tab === 'inventory' && (
          <>
            <input
              className="w-full md:w-80 bg-surface-container-low border border-outline-variant rounded-full px-lg py-sm text-body-md focus:ring-1 focus:ring-primary"
              placeholder="Search your inventory..."
              value={invQuery}
              onChange={(e) => setInvQuery(e.target.value)}
            />
            {filteredInventory.length === 0 ? (
              <EmptyState
                icon="inventory_2"
                title="No items found"
                message="Please adjust your filters. Your pantry might be empty right now."
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
                  return (
                    <Link
                      key={item.id}
                      to={`/inventory/${item.id}`}
                      className="bg-surface border border-outline-variant rounded-xl overflow-hidden editorial-shadow flex flex-col hover:-translate-y-1 transition-all"
                    >
                      <div className="h-40 overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-md flex-1 flex flex-col gap-xs">
                        <div className="flex justify-between items-start">
                          <h4 className="font-label-md text-primary">{item.name}</h4>
                          <Badge status={status}>{status === 'fresh' ? 'Fresh' : status === 'expiring' ? 'Expiring' : 'Expired'}</Badge>
                        </div>
                        <p className="text-label-sm text-on-surface-variant">
                          {item.category} • {item.quantity} {item.unit}
                        </p>
                        <p className="text-label-sm text-on-surface-variant">Best before {formatDate(item.expiryDate)}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <CreateDonationModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(formData) => {
          createDonation(formData);
          showToast('Listing published to Donations', 'success');
        }}
      />
    </AppLayout>
  );
}
