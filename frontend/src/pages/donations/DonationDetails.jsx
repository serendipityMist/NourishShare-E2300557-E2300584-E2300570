import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { useDonations } from '../../hooks/useDonations';
import { donationService } from '../../services/donationService';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDate } from '../../utils/dateUtils';

export default function DonationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDonationById, claimDonation } = useDonations();
  const { showToast, fetchNotifications } = useNotifications();
  const [donation, setDonation] = useState(() => getDonationById(id));
  const [loading, setLoading] = useState(!donation);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function loadDonation() {
      const cached = getDonationById(id);
      if (cached) {
        setDonation(cached);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await donationService.getDonationDetails(id);
        setDonation(res.data?.data?.donation || null);
      } catch (error) {
        setDonation(null);
      } finally {
        setLoading(false);
      }
    }

    loadDonation();
  }, [id, getDonationById]);

  if (loading) {
    return (
      <AppLayout title="Donation Details">
        <div className="flex justify-center items-center h-96">
          <p className="text-on-surface-variant">Loading donation details...</p>
        </div>
      </AppLayout>
    );
  }

  if (!donation) {
    return (
      <AppLayout title="Donation Details">
        <EmptyState
          icon="search_off"
          title="Listing not found or claimed"
          message="This donation may have already been claimed and removed from the available listings."
          action={
            <Link to="/donations">
              <Button>Back to Donations</Button>
            </Link>
          }
        />
      </AppLayout>
    );
  }

  const donationId = donation._id || donation.id;
  const itemName = donation.itemName || donation.food?.name || 'Food Item';
  const categoryName = donation.food?.category?.name || donation.category || '';
  const quantity = donation.food?.quantity
    ? `${donation.food.quantity.number} ${donation.food.quantity.units}`
    : donation.quantity || '';
  const image = donation.image || donation.food?.foodImage || 'https://via.placeholder.com/800x600?text=No+Image';
  const pickupLocation = donation.pickUpLocation || donation.pickupLocation || '';
  const pickupWindow = donation.availabilityTime || donation.pickupWindow || '';
  const donorName = donation.donor?.name || donation.donorName || 'Anonymous';
  const donorEmail = donation.donor?.email || '';
  const donorPhone = donation.donor?.phone || '';
  const isClaimed = donation.status === 'Claimed' || donation.status === 'claimed';

  async function handleClaim() {
    try {
      await claimDonation(donationId);
      await fetchNotifications();
      setShowSuccess(true);
    } catch (error) {
      showToast(error.message || 'Unable to claim donation', 'error');
    }
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
            <img src={image} alt={itemName} className="w-full h-full object-cover" />
            <div className="absolute top-lg right-lg">
              <div
                className={`px-lg py-sm rounded-full font-label-md flex items-center gap-sm editorial-shadow ${
                  isClaimed ? 'bg-outline-variant text-on-surface' : 'bg-primary text-on-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                {isClaimed ? 'Claimed' : 'Available Now'}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <div className="pb-lg border-b border-outline-variant mb-lg">
            {categoryName && (
              <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-md py-xs rounded-full font-label-sm uppercase tracking-wider">
                {categoryName}
              </span>
            )}
            <h2 className="font-headline-xl text-headline-xl text-primary mb-sm leading-tight mt-md">{itemName}</h2>
          </div>

          <div className="flex items-center gap-md p-md bg-surface-container-low rounded-xl border border-outline-variant mb-xl">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined">account_circle</span>
            </div>
            <div className="flex-1">
              <p className="font-label-md text-on-surface">{donorName}</p>
              {donorEmail && (
                <p className="font-body-md text-on-surface-variant text-[14px]">{donorEmail}</p>
              )}
              {donorPhone && (
                <p className="font-body-md text-on-surface-variant text-[14px]">{donorPhone}</p>
              )}
            </div>
          </div>

          <div className="space-y-lg mb-xl">
            {quantity && (
              <div className="flex items-start gap-md">
                <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant shrink-0">
                  <span className="material-symbols-outlined">scale</span>
                </div>
                <div>
                  <p className="font-label-md text-on-surface">Quantity</p>
                  <p className="font-body-md text-on-surface-variant">{quantity}</p>
                </div>
              </div>
            )}
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
                <p className="font-body-md text-on-surface-variant">{pickupLocation}</p>
                {pickupWindow && (
                  <p className="font-label-sm text-primary font-semibold mt-xs">Pickup Window: {pickupWindow}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-md">
            <Button
              className="w-full"
              icon="arrow_forward"
              disabled={isClaimed}
              onClick={handleClaim}
            >
              {isClaimed ? 'Already Claimed' : 'Claim this donation'}
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
              {donorName} has been notified. A confirmation was saved to your notifications.
            </p>
            <Button className="w-full" onClick={() => navigate('/notifications')}>
              View Notifications
            </Button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
