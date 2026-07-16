import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../hooks/useAuth';
import { useDonations } from '../hooks/useDonations';

const STEPS = [
  { icon: 'inventory_2', color: 'bg-tertiary-fixed text-tertiary', title: '1. Add Food', desc: 'Quickly log items as they enter your kitchen pantry.' },
  { icon: 'notifications_active', color: 'bg-secondary-fixed text-secondary', title: '2. Get Alerts', desc: 'Receive smart nudges before ingredients reach their expiry date.' },
  { icon: 'volunteer_activism', color: 'bg-primary-fixed text-primary', title: '3. Donate or Plan', desc: "Share surplus with neighbors or plan meals for what's left." },
  { icon: 'query_stats', color: 'bg-surface-container-highest text-on-surface', title: '4. Track Impact', desc: "See how much food you've saved and waste you've prevented." },
];

const STATS = [
  { value: '16.7k', label: 'Tonnes Saved' },
  { value: '4,200+', label: 'Households' },
  { value: 'RM 2.4M', label: 'Savings Generated' },
  { value: '100+', label: 'Local Partners' },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { donations } = useDonations();
  const recentDonations = donations.filter((d) => d.status === 'available').slice(0, 3);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-reveal');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.reveal-on-scroll').forEach((section) => {
      observer.observe(section);
    });
  }, []);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative py-xl md:py-margin-desktop overflow-hidden border-b border-outline-variant reveal-on-scroll">
        <div className="max-w-7xl mx-auto px-lg grid md:grid-cols-2 gap-xl items-center">
          <div className="z-10">
            <span className="inline-block bg-secondary-fixed text-on-secondary-fixed px-md py-xs rounded-full font-label-md mb-md">
              Fight Food Waste
            </span>
            <h1 className="font-headline-xl text-primary mb-lg leading-tight">
              Preserving Malaysia&apos;s flavors, one kitchen at a time.
            </h1>
            <p className="font-body-lg text-on-surface-variant mb-xl max-w-lg">
              Every day, Malaysians discard 16,000 tonnes of food. NourishShare is your digital pantry companion that helps you track inventory, reduce waste, and share surplus with your community.
            </p>
            <div className="flex flex-col sm:flex-row gap-md">
              <Link to={isAuthenticated ? '/dashboard' : '/register'}>
                <Button className="px-[56px] py-[18px] min-w-[195px]" icon="arrow_forward">
                  {isAuthenticated ? 'Go to Dashboard' : 'Start your Pantry'}
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="outline" className="px-[56px] py-[18px] min-w-[195px]">
                  Learn more
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary/10 blur-xl animate-float" />
            <div className="aspect-square rounded-full border border-primary/10 absolute -top-10 -right-10 w-full animate-pulse" />
            <div className="rounded-xl overflow-hidden border border-outline-variant shadow-lg rotate-1 reveal-on-scroll">
              <img
                className="w-full h-full object-cover"
                alt="Editorial Malaysian kitchen counter with fresh herbs and containers"
                src="https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=900&q=80"
              />
            </div>
            <div className="absolute bottom-0 left-0 w-36 h-36 rounded-3xl overflow-hidden border border-surface-container-low bg-surface shadow-xl -translate-y-10 reveal-on-scroll">
              <img
                className="w-full h-full object-cover"
                alt="Fresh Malaysian ingredients"
                src="https://picsum.photos/id/1080/500/500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <section className="bg-primary-container py-lg reveal-on-scroll">
        <div className="max-w-7xl mx-auto px-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-lg text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-headline-lg text-on-primary-container">{s.value}</p>
                <p className="font-label-sm text-on-primary-container/80 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-xl bg-surface-container-low border-b border-outline-variant reveal-on-scroll" id="how-it-works">
        <div className="max-w-7xl mx-auto px-lg">
          <div className="text-center mb-xl">
            <h2 className="font-headline-lg text-primary mb-sm">The Mindful Kitchen Loop</h2>
            <p className="font-body-md text-on-surface-variant">Simple steps to a more sustainable lifestyle.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-lg">
            {STEPS.map((step) => (
              <div key={step.title} className="flex flex-col items-center text-center p-lg bg-surface border border-outline-variant rounded-lg card-hover reveal-on-scroll transition-transform duration-500 hover:-translate-y-1">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-md ${step.color}`}>
                  <span className="material-symbols-outlined text-3xl">{step.icon}</span>
                </div>
                <h3 className="font-label-md text-primary mb-sm">{step.title}</h3>
                <p className="font-label-sm text-on-surface-variant">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-xl reveal-on-scroll" id="features">
        <div className="max-w-7xl mx-auto px-lg">
          <div className="mb-xl max-w-2xl">
            <h2 className="font-headline-lg text-primary mb-sm">Designed for the modern domestic life</h2>
            <p className="font-body-md text-on-surface-variant">A suite of tools that feel as natural as a handwritten shopping list, but smarter.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-md">
            <div className="md:col-span-2 bg-surface border border-outline-variant p-lg rounded-xl flex flex-col justify-between hover:border-primary transition-colors reveal-on-scroll">
              <div>
                <span className="material-symbols-outlined text-primary mb-md">kitchen</span>
                <h3 className="font-headline-md text-primary mb-sm">Visual Inventory Management</h3>
                <p className="font-body-md text-on-surface-variant max-w-md">
                  Categorize your staples with an interface inspired by heritage pantry ledgers. See exactly what&apos;s in stock at a glance.
                </p>
              </div>
              <div className="mt-lg h-32 bg-surface-container-low rounded-lg border border-dashed border-outline-variant flex items-center justify-center overflow-hidden">
                <img
                  className="w-full h-full object-cover opacity-80"
                  alt="Pantry mockup preview"
                  src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80"
                />
              </div>
            </div>
            <div className="bg-secondary-container p-lg rounded-xl text-on-secondary-container card-hover reveal-on-scroll">
              <span className="material-symbols-outlined mb-md text-3xl">timer</span>
              <h3 className="font-headline-md mb-sm">Expiry Alerts</h3>
              <p className="font-body-md opacity-90">Gentle reminders that prioritize your most perishable items, like fresh produce and dairy.</p>
            </div>
            <div className="bg-primary p-lg rounded-xl text-on-primary card-hover reveal-on-scroll">
              <span className="material-symbols-outlined mb-md text-3xl">handshake</span>
              <h3 className="font-headline-md mb-sm">Community Donations</h3>
              <p className="font-body-md opacity-90">Securely list excess food for local shelters or neighbors in a few taps.</p>
            </div>
            <div className="md:col-span-2 bg-tertiary-fixed p-lg rounded-xl flex items-center gap-lg card-hover reveal-on-scroll">
              <div className="flex-1">
                <span className="material-symbols-outlined text-tertiary mb-md">restaurant_menu</span>
                <h3 className="font-headline-md text-tertiary mb-sm">Smart Meal Planner</h3>
                <p className="font-body-md text-on-tertiary-fixed-variant">
                  Our recipe suggestions are based on what&apos;s already in your pantry, focusing on Malaysian home cooking.
                </p>
              </div>
              <div className="hidden sm:block w-1/3 aspect-square rounded-lg overflow-hidden border border-tertiary/20">
                <img
                  className="w-full h-full object-cover"
                  alt="Close-up of vibrant Malaysian cuisine"
                  src="https://images.unsplash.com/photo-1543353071-087092ec393a?auto=format&fit=crop&w=600&q=80"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community impact */}
      <section className="py-xl bg-surface border-y border-outline-variant overflow-hidden reveal-on-scroll">
        <div className="max-w-7xl mx-auto px-lg">
          <div className="flex flex-col md:flex-row justify-between items-end mb-xl gap-md">
            <div>
              <h2 className="font-headline-lg text-primary mb-sm">Shared Recently in Your Area</h2>
              <p className="font-body-md text-on-surface-variant">Join the circle of care in Kuala Lumpur and beyond.</p>
            </div>
            <Link to={isAuthenticated ? '/donations' : '/register'} className="text-primary font-label-md flex items-center gap-xs hover:underline">
              View Community Map <span className="material-symbols-outlined">arrow_right_alt</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
            {recentDonations.map((donation) => (
              <div key={donation.id} className="bg-surface border border-outline-variant rounded-lg overflow-hidden group">
                <div className="h-48 overflow-hidden relative">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={donation.image}
                    alt={donation.itemName}
                  />
                  <div className="absolute top-md right-md bg-primary text-on-primary px-sm py-xs rounded-md font-label-sm">
                    Free
                  </div>
                </div>
                <div className="p-md">
                  <div className="flex justify-between items-start mb-xs">
                    <h4 className="font-label-md text-primary">{donation.itemName}</h4>
                    <span className="text-xs text-on-surface-variant">{donation.createdAt ? donation.createdAt : 'New'}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mb-md flex items-center gap-xs">
                    <span className="material-symbols-outlined text-sm">location_on</span> {donation.pickupLocation}
                  </p>
                  <Link to={isAuthenticated ? `/donations/${donation.id}` : '/login'}>
                    <Button variant="primary" className="w-full py-sm font-label-sm">View Listing</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-xl text-center px-lg reveal-on-scroll">
        <div className="max-w-3xl mx-auto bg-[#FCE6DE] text-on-surface p-xl rounded-2xl relative overflow-hidden border border-outline-variant">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <h2 className="font-headline-lg mb-md">Ready to reduce your kitchen&apos;s footprint?</h2>
          <p className="font-body-md mb-xl opacity-90">
            Join thousands of Malaysian households in the journey toward zero waste. Start your digital pantry today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-md">
            <Link to={isAuthenticated ? '/dashboard' : '/register'}>
              <Button
                variant="primary"
                className="rounded-[12px] bg-primary px-14 py-4 min-w-[220px] text-headline-md shadow-md"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Join NourishShare'}
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                variant="outline"
                className="rounded-[12px] px-14 py-4 min-w-[220px] text-headline-md text-primary border-0 bg-[#F7D2C4] hover:bg-[#FCE6DE] transition-colors duration-200"
              >
                Contact Sales for Organizations
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
