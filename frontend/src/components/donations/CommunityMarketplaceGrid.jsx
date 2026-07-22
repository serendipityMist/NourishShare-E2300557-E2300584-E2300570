import { Link } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import { formatRelativeTime } from '../../utils/dateUtils';

function donorInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function mapDonationFields(donation) {
  const id = donation._id || donation.id;
  const itemName = donation.food?.name || donation.itemName || 'Food item';
  const image =
    donation.food?.foodImage ||
    donation.image ||
    'https://via.placeholder.com/400x300?text=No+Image';
  const pickupLocation =
    donation.pickUpLocation || donation.pickupLocation || 'Pickup location shared after login';
  const donorName = donation.donor?.name || donation.donorName || 'Community member';
  const categoryName = donation.food?.category?.name || donation.category || '';
  const description =
    donation.food?.description ||
    donation.notes ||
    (categoryName ? `${categoryName} available for pickup.` : 'Shared with the community.');
  const listedAgo = donation.createdAt
    ? formatRelativeTime(new Date(donation.createdAt).getTime())
    : 'New';

  return {
    id,
    itemName,
    image,
    pickupLocation,
    donorName,
    description,
    listedAgo,
    initials: donorInitials(donorName),
  };
}

export default function CommunityMarketplaceGrid({
  donations,
  loading,
  isAuthenticated,
  variant = 'home',
  emptyMessage = 'No community listings yet. Be the first to share surplus food!',
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
        {[1, 2, 3].map((slot) => (
          <div
            key={slot}
            className="bg-surface border border-outline-variant rounded-lg overflow-hidden animate-pulse"
          >
            <div className="h-48 bg-surface-container-low" />
            <div className="p-md space-y-md">
              <div className="h-4 bg-surface-container-low rounded w-3/4" />
              <div className="h-3 bg-surface-container-low rounded w-1/2" />
              <div className="h-10 bg-surface-container-low rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!donations.length) {
    return (
      <div className="bg-surface border border-dashed border-outline-variant rounded-xl p-xl text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-sm">
          volunteer_activism
        </span>
        <p className="font-body-md text-on-surface-variant max-w-md mx-auto">
          {emptyMessage}
        </p>
        <Link to={isAuthenticated ? '/inventory' : '/register'} className="inline-block mt-md">
          <Button icon="add">{isAuthenticated ? 'List from Inventory' : 'Join to Share Food'}</Button>
        </Link>
      </div>
    );
  }

  const listingLink = (id) =>
    isAuthenticated ? `/donations/${id}` : '/login';

  if (variant === 'features') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
        {donations.map((donation) => {
          const item = mapDonationFields(donation);

          return (
            <div
              key={item.id}
              className="bg-white border border-outline-variant rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="h-48 relative">
                <img
                  src={item.image}
                  alt={item.itemName}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-md left-md bg-secondary text-white px-md py-xs rounded-full text-label-sm">
                  Free
                </span>
              </div>
              <div className="p-md space-y-sm flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-sm">
                  <h4 className="font-headline-md text-headline-md line-clamp-2">{item.itemName}</h4>
                  <span className="text-label-sm text-on-surface-variant shrink-0">{item.listedAgo}</span>
                </div>
                <p className="text-on-surface-variant text-sm line-clamp-2">{item.description}</p>
                <p className="text-label-sm text-on-surface-variant flex items-start gap-xs">
                  <span className="material-symbols-outlined text-sm shrink-0">location_on</span>
                  <span className="line-clamp-2">{item.pickupLocation}</span>
                </p>
                <div className="flex items-center gap-sm pt-sm border-t border-outline-variant mt-auto">
                  <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs">
                    {item.initials}
                  </div>
                  <span className="text-label-sm font-semibold">{item.donorName}</span>
                </div>
                <Link to={listingLink(item.id)} className="pt-sm">
                  <Button variant="primary" className="w-full py-sm font-label-sm">
                    View Listing
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
      {donations.map((donation) => {
        const item = mapDonationFields(donation);

        return (
          <div
            key={item.id}
            className="bg-surface border border-outline-variant rounded-lg overflow-hidden group flex flex-col"
          >
            <div className="h-48 overflow-hidden relative">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src={item.image}
                alt={item.itemName}
              />
              <div className="absolute top-md right-md bg-primary text-on-primary px-sm py-xs rounded-md font-label-sm">
                Free
              </div>
            </div>
            <div className="p-md flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-xs gap-sm">
                <h4 className="font-label-md text-primary line-clamp-2">{item.itemName}</h4>
                <span className="text-xs text-on-surface-variant shrink-0">{item.listedAgo}</span>
              </div>
              <p className="text-xs text-on-surface-variant mb-md flex items-start gap-xs line-clamp-2">
                <span className="material-symbols-outlined text-sm shrink-0">location_on</span>
                {item.pickupLocation}
              </p>
              <Link to={listingLink(item.id)} className="mt-auto">
                <Button variant="primary" className="w-full py-sm font-label-sm">
                  View Listing
                </Button>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
