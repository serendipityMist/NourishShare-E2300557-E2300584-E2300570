import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout.jsx';
import { useAuth } from '../hooks/useAuth';
import { useInventory } from '../hooks/useInventory';
import { useDonations } from '../hooks/useDonations';
import { getExpiryStatus, daysUntil, formatDate } from '../utils/dateUtils';
import EmptyState from '../components/ui/EmptyState.jsx';
import Button from '../components/ui/Button.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const { activeItems } = useInventory();
  const { claimedDonations, claimedCount } = useDonations();

  if (!user) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex justify-center items-center h-96">
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      </AppLayout>
    );
  }

  const firstName = user?.name?.split(' ')[0] || 'User';

  const expiringSoon = activeItems.filter((i) =>
    ['expiring', 'expired'].includes(getExpiryStatus(i.expiryDate))
  );

  const freshCount = activeItems.length - expiringSoon.length;
  const healthPercent = activeItems.length
    ? Math.round((freshCount / activeItems.length) * 100)
    : 100;

  const hasPantryContent = activeItems.length > 0 || claimedDonations.length > 0;

  if (!hasPantryContent) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex flex-col items-center justify-center py-xl">
          <h3 className="font-headline-lg text-headline-lg text-primary mb-sm">
            Your Pantry is Quiet
          </h3>

          <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg max-w-xl text-center">
            Every great meal starts with a single ingredient. Start tracking
            your household staples to reduce waste and share abundance with your
            community.
          </p>

          <div className="flex gap-md">
            <Link to="/inventory?add=1">
              <Button icon="add_circle">Add Your First Item</Button>
            </Link>

            <Link to="/donations">
              <Button variant="outline" icon="explore">
                Browse Nearby Donations
              </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard">
      <section className="mb-xl">
        <h2 className="font-headline-xl text-headline-xl text-primary mb-sm">
          Welcome back, {firstName}.
        </h2>

        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
          Here&apos;s what&apos;s happening in your digital pantry today.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
        <div className="bg-tertiary-container text-on-tertiary-container p-lg rounded-xl sticker-shadow flex flex-col justify-between">
          <div>
            <p className="font-label-md opacity-80 uppercase tracking-widest">
              Inventory Health
            </p>

            <h3 className="font-headline-lg text-headline-lg mt-sm">
              {healthPercent >= 70
                ? 'Good'
                : healthPercent >= 40
                ? 'Fair'
                : 'Needs Attention'}
            </h3>
          </div>

          <div className="mt-xl">
            <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-on-tertiary-container"
                style={{ width: `${healthPercent}%` }}
              />
            </div>

            <p className="font-label-sm mt-xs">
              {healthPercent}% of your items are fresh
            </p>
          </div>
        </div>

        <div className="bg-secondary-fixed text-on-secondary-fixed-variant p-lg rounded-xl sticker-shadow flex flex-col justify-between">
          <div>
            <p className="font-label-md opacity-80 uppercase tracking-widest">
              Waste Alert
            </p>

            <h3 className="font-headline-lg text-headline-lg mt-sm">
              {expiringSoon.length} Items
            </h3>
          </div>

          <Link
            to="/inventory"
            className="mt-xl flex items-center gap-sm hover:underline"
          >
            <span className="material-symbols-outlined">hourglass_top</span>
            <p className="font-label-sm">Expiring soon or already expired</p>
          </Link>
        </div>

        <div className="bg-primary-fixed text-on-primary-fixed-variant p-lg rounded-xl sticker-shadow flex flex-col justify-between">
          <div>
            <p className="font-label-md opacity-80 uppercase tracking-widest">
              My Claims
            </p>

            <h3 className="font-headline-lg text-headline-lg mt-sm">
              {claimedCount} Claimed
            </h3>
          </div>

          <a
            href="#claimed-donations"
            className="mt-xl flex items-center gap-sm hover:underline"
          >
            <span className="material-symbols-outlined">volunteer_activism</span>
            <p className="font-label-sm">View your claimed donations</p>
          </a>
        </div>
      </div>

      {activeItems.length > 0 && (
        <div className="bg-white border border-outline-variant rounded-xl p-lg mb-xl">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-headline-md text-headline-md text-primary">
              Expiring Soon
            </h3>

            <Link
              to="/inventory"
              className="text-label-md text-primary hover:underline"
            >
              View all inventory
            </Link>
          </div>

          {expiringSoon.length === 0 ? (
            <EmptyState
              icon="eco"
              title="Nothing expiring"
              message="Your pantry is in great shape right now."
            />
          ) : (
            <div className="divide-y divide-outline-variant/30">
              {expiringSoon.slice(0, 5).map((item) => {
                const days = daysUntil(item.expiryDate);
                const categoryName =
                  typeof item.category === 'object'
                    ? item.category?.name
                    : item.category;

                return (
                  <Link
                    key={item._id}
                    to={`/inventory/${item._id}`}
                    className="flex items-center justify-between py-sm hover:bg-surface-container-low px-sm rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-md">
                      <img
                        src={item.foodImage || 'https://via.placeholder.com/40'}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />

                      <div>
                        <p className="font-body-md font-semibold text-primary">
                          {item.name}
                        </p>
                        <p className="font-label-sm text-on-surface-variant">
                          {categoryName || ''}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`font-label-sm font-bold ${
                        days < 0 ? 'text-error' : 'text-secondary'
                      }`}
                    >
                      {days < 0
                        ? `Expired ${Math.abs(days)}d ago`
                        : days === 0
                        ? 'Expires today'
                        : `${days}d left`}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div
        id="claimed-donations"
        className="bg-white border border-outline-variant rounded-xl p-lg"
      >
        <div className="flex justify-between items-center mb-md">
          <div>
            <h3 className="font-headline-md text-headline-md text-primary">
              Claimed Donations
            </h3>
            <p className="font-body-md text-on-surface-variant mt-xs">
              Donations you have claimed — pickup details saved from the database.
            </p>
          </div>

          <Link
            to="/donations"
            className="text-label-md text-primary hover:underline"
          >
            Browse more
          </Link>
        </div>

        {claimedDonations.length === 0 ? (
          <EmptyState
            icon="volunteer_activism"
            title="No claimed donations yet"
            message="Browse community listings and claim items you'd like to pick up."
            action={
              <Link to="/donations">
                <Button icon="explore">Browse Donations</Button>
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-outline-variant/30">
            {claimedDonations.map((donation) => {
              const itemName = donation.food?.name || 'Food item';
              const categoryName = donation.food?.category?.name || '';
              const donorName = donation.donor?.name || 'Anonymous';
              const image =
                donation.food?.foodImage ||
                'https://via.placeholder.com/40';

              return (
                <Link
                  key={donation._id}
                  to={`/donations/${donation._id}`}
                  className="flex items-start justify-between gap-md py-md hover:bg-surface-container-low px-sm rounded-lg transition-colors"
                >
                  <div className="flex items-start gap-md min-w-0">
                    <img
                      src={image}
                      alt={itemName}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />

                    <div className="min-w-0">
                      <p className="font-body-md font-semibold text-primary">
                        {itemName}
                      </p>
                      <p className="font-label-sm text-on-surface-variant">
                        {categoryName && `${categoryName} • `}
                        From {donorName}
                      </p>
                      <p className="font-label-sm text-on-surface-variant mt-xs">
                        <span className="material-symbols-outlined text-[14px] align-middle mr-1">
                          location_on
                        </span>
                        {donation.pickUpLocation}
                      </p>
                      <p className="font-label-sm text-primary mt-xs">
                        Pickup: {donation.availabilityTime}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-primary-fixed text-primary font-label-sm">
                      <span className="material-symbols-outlined text-[16px]">
                        check_circle
                      </span>
                      Claimed
                    </span>
                    <p className="font-label-sm text-on-surface-variant mt-sm">
                      Expires {formatDate(donation.expiryDate)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
