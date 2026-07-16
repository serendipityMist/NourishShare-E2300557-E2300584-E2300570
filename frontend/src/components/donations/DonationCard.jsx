import { Link } from 'react-router-dom';
import { daysUntil, formatDate } from '../../utils/dateUtils';

export default function DonationCard({ donation, onClaim }) {
  const days = daysUntil(donation.expiryDate);
  const isClaimed = donation.status === 'claimed';

  return (
    <div className="group bg-surface border border-outline-variant rounded-xl overflow-hidden editorial-shadow flex flex-col transition-all hover:-translate-y-1">
      <Link to={`/donations/${donation.id}`} className="relative h-48 overflow-hidden block">
        <img
          src={donation.image}
          alt={donation.itemName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {isClaimed ? (
          <div className="absolute inset-0 bg-inverse-surface/40 flex items-center justify-center">
            <div className="bg-surface text-on-surface px-lg py-sm rounded-full font-label-md border-2 border-primary">
              CLAIMED
            </div>
          </div>
        ) : (
          <div className="absolute top-sm right-sm bg-surface/90 backdrop-blur px-md py-xs rounded-full font-label-sm text-secondary flex items-center gap-xs">
            <span className="material-symbols-outlined text-[14px]">timer</span>
            {days < 0 ? 'Expired' : days === 0 ? 'Expires today' : `Expires in ${days}d`}
          </div>
        )}
      </Link>
      <div className="p-lg flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-sm">
          <Link to={`/donations/${donation.id}`}>
            <h3 className="font-headline-md text-on-surface hover:text-primary transition-colors">{donation.itemName}</h3>
          </Link>
          <span className="bg-secondary-fixed text-on-secondary-fixed px-sm py-xs rounded font-label-sm border border-outline-variant whitespace-nowrap">
            {donation.category?.toUpperCase()}
          </span>
        </div>
        <div className="space-y-sm mb-lg text-on-surface-variant">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-outline text-[18px]">location_on</span>
            <span className="text-label-md">
              {donation.distanceKm ? `${donation.distanceKm} km • ` : ''}
              {donation.pickupLocation}
            </span>
          </div>
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-outline text-[18px]">event_available</span>
            <span className="text-label-md">Pickup: {donation.pickupWindow}</span>
          </div>
          {donation.expiryDate && (
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-outline text-[18px]">event_busy</span>
              <span className="text-label-md">Best before {formatDate(donation.expiryDate)}</span>
            </div>
          )}
        </div>
        <button
          disabled={isClaimed}
          onClick={() => onClaim(donation)}
          className={`w-full mt-auto py-md rounded-lg font-label-md transition-all ${
            isClaimed
              ? 'bg-surface-container text-on-surface-variant cursor-not-allowed'
              : 'bg-primary text-on-primary active:scale-95'
          }`}
        >
          {isClaimed ? 'Unavailable' : 'Claim Item'}
        </button>
      </div>
    </div>
  );
}
