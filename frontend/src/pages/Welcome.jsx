import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../hooks/useAuth';

const STEPS = [
  {
    icon: 'inventory',
    color: 'bg-primary-fixed text-primary',
    title: 'Add first item',
    description: 'Catalog your essentials to start tracking freshness and stock levels.',
    cta: 'Get Started',
    to: '/inventory?add=1',
  },
  {
    icon: 'volunteer_activism',
    color: 'bg-secondary-fixed text-secondary',
    title: 'Explore donations',
    description: 'Discover surplus food shared by neighbors near you.',
    cta: 'Browse Listings',
    to: '/donations',
  },
  {
    icon: 'lock',
    color: 'bg-tertiary-fixed text-tertiary',
    title: 'Review privacy settings',
    description: 'Control who can see your listings and enable extra account security.',
    cta: 'Open Settings',
    to: '/settings',
  },
];

export default function Welcome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <AppLayout title="Welcome">
      <section className="mb-xl flex flex-col md:flex-row items-center gap-xl">
        <div className="flex-1">
          <h2 className="font-headline-xl text-headline-xl text-primary mb-md">
            Welcome to your digital pantry, {user.fullName.split(' ')[0]}.
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
            SavePlate is here to help you manage your kitchen with care. Let&apos;s get your pantry organized to
            reduce waste and share surplus with your community.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
        {STEPS.map((step) => (
          <button
            key={step.title}
            onClick={() => navigate(step.to)}
            className="text-left bg-white p-lg rounded-xl border border-outline-variant hover:shadow-md transition-shadow group"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-md ${step.color}`}>
              <span className="material-symbols-outlined">{step.icon}</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-primary mb-sm">{step.title}</h3>
            <p className="font-body-md text-on-surface-variant mb-md">{step.description}</p>
            <div className="flex items-center text-primary font-label-md gap-xs">
              <span>{step.cta}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-lg mt-xl">
        <Button className="w-full md:w-auto" icon="arrow_forward" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
        <Button variant="ghost" className="w-full md:w-auto" onClick={() => navigate('/dashboard')}>
          Skip for now, I&apos;ll explore myself
        </Button>
      </div>
    </AppLayout>
  );
}
