import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { useDonations } from '../../hooks/useDonations';
import { formatDate } from '../../utils/dateUtils';

export default function DonationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDonationById, claimDonation } = useDonations();
  const donation = getDonationById(id);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!donation) {
    return (
      <AppLayout title="Donation Details">
        <EmptyState
          icon="search_off"
          title="Listing not found"
          message="This donation may have already been claimed and removed."
          action={
            <Link to="/donations">
              <Button>Back to Donations</Button>
            </Link>
          }
        />
      </AppLayout>
    );
  }

  function handleClaim() {
    claimDonation(donation.id);
    setShowSuccess(true);
  }

  return (
    <AppLayout title="Donation Details">
      <div className="mb-lg">
        <Link
          to="/donations"
          className="inline-flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors font-label-md group"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
            arrow_back
          </span>
          Back to All Donations
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
        <div className="lg:col-span-7 space-y-lg">
          <div className="relative aspect-[4/5] md:aspect-video lg:aspect-[4/5] rounded-xl overflow-hidden bg-surface-container-highest border border-outline-variant editorial-shadow">
            <img src={donation.image} alt={donation.itemName} className="w-full h-full object-cover" />
            <div className="absolute top-lg right-lg">
              <div
                className={`px-lg py-sm rounded-full font-label-md flex items-center gap-sm editorial-shadow ${
                  donation.status === 'claimed' ? 'bg-outline-variant text-on-surface' : 'bg-primary text-on-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                {donation.status === 'claimed' ? 'Claimed' : 'Available Now'}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <div className="pb-lg border-b border-outline-variant mb-lg">
            <div className="flex items-center gap-sm mb-md">
              <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-md py-xs rounded-full font-label-sm uppercase tracking-wider">
                {donation.category}
              </span>
              <span className="text-on-surface-variant font-label-sm">• Item #{donation.id}</span>
            </div>
            <h2 className="font-headline-xl text-headline-xl text-primary mb-sm leading-tight">{donation.itemName}</h2>
          </div>

          <div className="flex items-center gap-md p-md bg-surface-container-low rounded-xl border border-outline-variant mb-xl">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined">account_circle</span>
            </div>
            <div className="flex-1">
              <p className="font-label-md text-on-surface">{donation.donorName}</p>
              <p className="font-body-md text-on-surface-variant text-[14px]">{donation.donorRole}</p>
            </div>
          </div>

          <div className="space-y-lg mb-xl">
            <div className="flex items-start gap-md">
              <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant shrink-0">
                <span className="material-symbols-outlined">scale</span>
              </div>
              <div>
                <p className="font-label-md text-on-surface">Quantity</p>
                <p className="font-body-md text-on-surface-variant">{donation.quantity}</p>
              </div>
            </div>
            <div className="flex items-start gap-md">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant shrink-0">
                <span className="material-symbols-outlined">event_busy</span>
              </div>
              <div>
                <p className="font-label-md text-on-surface">Best Before</p>
                <p className="font-body-md text-error font-semibold">{formatDate(donation.expiryDate)}</p>
              </div>
            </div>
            <div className="flex items-start gap-md">
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed-variant shrink-0">
                <span className="material-symbols-outlined">location_on</span>
              </div>
              <div className="flex-1">
                <p className="font-label-md text-on-surface">Pickup Location</p>
                <p className="font-body-md text-on-surface-variant">{donation.pickupLocation}</p>
                <p className="font-label-sm text-primary font-semibold mt-xs">Pickup Window: {donation.pickupWindow}</p>
              </div>
            </div>
          </div>

          {donation.notes && (
            <div className="p-lg bg-surface-container-highest/30 rounded-xl border-l-4 border-secondary mb-xl">
              <h4 className="font-label-md text-secondary mb-xs uppercase tracking-wide">Donor&apos;s Note</h4>
              <p className="font-body-md italic text-on-surface-variant leading-relaxed">&quot;{donation.notes}&quot;</p>
            </div>
          )}

          <div className="mt-auto space-y-md">
            <Button
              className="w-full"
              icon="arrow_forward"
              disabled={donation.status === 'claimed'}
              onClick={handleClaim}
            >
              {donation.status === 'claimed' ? 'Already Claimed' : 'Claim this donation'}
            </Button>
            <p className="text-center font-label-sm text-on-surface-variant">
              By claiming, you agree to the community safety guidelines.
            </p>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm">
          <div className="bg-surface p-xl rounded-2xl border border-outline-variant shadow-2xl max-w-md w-full text-center">
            <div className="w-20 h-20 bg-primary-fixed rounded-full flex items-center justify-center mx-auto mb-lg text-on-primary-fixed-variant">
              <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <h3 className="font-headline-md text-primary mb-sm">Claimed Successfully!</h3>
            <p className="font-body-md text-on-surface-variant mb-xl">
              {donation.donorName} has been notified. Please head to the pickup location within the allocated window.
            </p>
            <Button className="w-full" onClick={() => navigate('/donations')}>
              Go to My Claims
            </Button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
