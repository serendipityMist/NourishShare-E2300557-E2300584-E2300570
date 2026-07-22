import { Link } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import Badge from '../ui/Badge.jsx';
import { daysUntil, formatDate } from '../../utils/dateUtils';

export default function MyListingCard({ donation, onEdit, onRemove }) {
  const donationId = donation._id || donation.id;
  const isClaimed = donation.status === 'Claimed';
  const itemName = donation.food?.name || donation.itemName || 'Food item';
  const categoryName =
    donation.food?.category?.name ||
    (typeof donation.food?.category === 'string' ? donation.food.category : '') ||
    donation.category ||
    'Uncategorized';
  const image =
    donation.food?.foodImage ||
    donation.image ||
    'https://via.placeholder.com/400x300?text=No+Image';
  const quantity = donation.food?.quantity
    ? `${donation.food.quantity.number} ${donation.food.quantity.units}`
    : null;
  const days = daysUntil(donation.expiryDate);

  return (
    <div className="group bg-surface border border-outline-variant rounded-xl overflow-hidden editorial-shadow flex flex-col h-full transition-all hover:-translate-y-1">
      <Link
        to={`/donations/${donationId}`}
        className="relative h-48 overflow-hidden block shrink-0"
      >
        <img
          src={image}
          alt={itemName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-sm left-sm">
          <Badge status={isClaimed ? 'claimed' : 'available'}>
            {isClaimed ? 'Claimed' : 'Available'}
          </Badge>
        </div>
        {!isClaimed && days !== null && (
          <div className="absolute top-sm right-sm bg-surface/90 backdrop-blur px-md py-xs rounded-full font-label-sm text-secondary flex items-center gap-xs">
            <span className="material-symbols-outlined text-[14px]">timer</span>
            {days < 0 ? 'Expired' : days === 0 ? 'Expires today' : `Expires in ${days}d`}
          </div>
        )}
        {isClaimed && (
          <div className="absolute inset-0 bg-inverse-surface/30 flex items-center justify-center">
            <span className="bg-surface px-lg py-sm rounded-full font-label-md border-2 border-outline-variant">
              Claimed by community member
            </span>
          </div>
        )}
      </Link>

      <div className="p-lg flex flex-col flex-1 min-h-0">
        <div className="flex justify-between items-start gap-sm mb-sm">
          <Link to={`/donations/${donationId}`} className="min-w-0">
            <h3 className="font-headline-md text-on-surface hover:text-primary transition-colors line-clamp-2">
              {itemName}
            </h3>
          </Link>
          <span className="bg-secondary-fixed text-on-secondary-fixed px-sm py-xs rounded font-label-sm border border-outline-variant whitespace-nowrap shrink-0 max-w-[120px] truncate">
            {categoryName.toUpperCase()}
          </span>
        </div>

        <div className="space-y-sm mb-lg text-on-surface-variant flex-1">
          {quantity && (
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-outline text-[18px]">scale</span>
              <span className="text-label-md">{quantity}</span>
            </div>
          )}
          <div className="flex items-start gap-sm">
            <span className="material-symbols-outlined text-outline text-[18px] shrink-0">location_on</span>
            <span className="text-label-md break-words">{donation.pickUpLocation}</span>
          </div>
          <div className="flex items-start gap-sm">
            <span className="material-symbols-outlined text-outline text-[18px] shrink-0">event_available</span>
            <span className="text-label-md break-words">{donation.availabilityTime}</span>
          </div>
          {donation.expiryDate && (
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-outline text-[18px]">event_busy</span>
              <span className="text-label-md">Best before {formatDate(donation.expiryDate)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-sm mt-auto pt-md border-t border-outline-variant/40">
          <Button
            variant="outline"
            className="flex-1 w-full"
            icon="edit"
            disabled={isClaimed}
            onClick={() => onEdit(donation)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            className="flex-1 w-full"
            icon="delete"
            disabled={isClaimed}
            onClick={() => onRemove(donation)}
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
