import { Link } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout.jsx';
import { useAuth } from '../hooks/useAuth';

export default function HowItWorks() {
  const { isAuthenticated } = useAuth();

  return (
    <PublicLayout>
      <main className="max-w-[1200px] mx-auto px-[20px] md:px-[64px] py-xl">
        <section className="mb-xl text-center max-w-3xl mx-auto">
          <span className="inline-block bg-secondary-fixed text-on-secondary-fixed-variant px-md py-xs rounded-full font-label-md mb-md">
            THE MINDFUL KITCHEN LOOP
          </span>
          <h1 className="font-headline-xl text-headline-xl mb-lg text-primary">Less Waste, More Taste.</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Join a community committed to sustainable living. NourishShare helps you track your pantry, plan meals, and share surplus—all in one elegant digital ledger.
          </p>
        </section>

        <section className="relative mb-xl grid grid-cols-1 md:grid-cols-2 gap-xl items-center">
          <div className="order-2 md:order-1 space-y-xl">
            <div className="group flex gap-lg p-lg bg-surface border border-outline-variant rounded-xl transition-all hover:shadow-md hover:-translate-y-1">
              <div className="w-12 h-12 flex-shrink-0 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center font-headline-md transition-transform">
                1
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-primary mb-sm">Add Food</h3>
                <p className="text-on-surface-variant mb-md">
                  Scan receipts or log items manually as they enter your kitchen. Our smart recognition categorizes your groceries instantly.
                </p>
                <div className="flex flex-wrap gap-sm">
                  <span className="bg-surface-container text-on-surface-variant px-sm py-xs rounded font-label-sm border border-outline-variant">
                    SCANNER
                  </span>
                  <span className="bg-surface-container text-on-surface-variant px-sm py-xs rounded font-label-sm border border-outline-variant">
                    MANUAL ENTRY
                  </span>
                </div>
              </div>
            </div>

            <div className="group flex gap-lg p-lg bg-surface border border-outline-variant rounded-xl transition-all hover:shadow-md hover:-translate-y-1">
              <div className="w-12 h-12 flex-shrink-0 bg-secondary-container text-on-secondary-container rounded-full flex items-center justify-center font-headline-md transition-transform">
                2
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-primary mb-sm">Get Alerts</h3>
                <p className="text-on-surface-variant mb-md">
                  Receive smart nudges before your ingredients reach their prime. We use warm ochre visuals to highlight urgent items.
                </p>
                <div className="flex gap-sm">
                  <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-sm py-xs rounded font-label-sm border border-outline-variant">
                    SMART NOTIFICATIONS
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2 flex justify-center">
            <div className="relative w-full aspect-square max-w-md bg-surface-container rounded-full border-4 border-dashed border-outline-variant flex items-center justify-center p-lg overflow-hidden">
              <div className="z-10 text-center p-xl bg-white border border-outline-variant shadow-lg rounded-xl transform rotate-3">
                <span className="material-symbols-outlined text-6xl text-secondary mb-md">restaurant_menu</span>
                <p className="font-headline-md text-primary">Your Digital Pantry</p>
                <div className="w-full h-1 bg-outline-variant my-md relative rounded-full overflow-hidden">
                  <div className="absolute left-0 top-0 h-full w-2/3 bg-secondary rounded-full" />
                </div>
                <p className="font-label-md text-on-surface-variant">4 Items Expiring Soon</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-xl items-center mb-xl">
          <div className="flex justify-center">
            <div
              className="w-full aspect-[4/3] rounded-xl border border-outline-variant bg-cover bg-center shadow-md"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1534278931824-2a5df74f3631?auto=format&fit=crop&w=1000&q=80')",
              }}
            />
          </div>

          <div className="flex flex-col gap-xl">
            <div className="group flex gap-lg p-lg bg-surface border border-outline-variant rounded-xl transition-all hover:shadow-md hover:-translate-y-1">
              <div className="w-12 h-12 flex-shrink-0 bg-tertiary-container text-on-tertiary-container rounded-full flex items-center justify-center font-headline-md transition-transform">
                3
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-primary mb-sm">Donate or Plan</h3>
                <p className="text-on-surface-variant mb-md">
                  Can&apos;t finish it in time? Share surplus with your neighbors through our secure portal, or generate recipes for what&apos;s left in your pantry.
                </p>
                <div className="flex flex-wrap gap-sm">
                  <button className="bg-primary text-on-primary px-md py-sm rounded-full font-label-md flex items-center gap-xs">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      volunteer_activism
                    </span>
                    Donate Surplus
                  </button>
                  <button className="border border-primary text-primary px-md py-sm rounded-full font-label-md">
                    Recipe Ideas
                  </button>
                </div>
              </div>
            </div>

            <div className="group flex gap-lg p-lg bg-surface border border-outline-variant rounded-xl transition-all hover:shadow-md hover:-translate-y-1">
              <div className="w-12 h-12 flex-shrink-0 bg-surface-container-highest text-on-surface rounded-full flex items-center justify-center font-headline-md transition-transform">
                4
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-primary mb-sm">Track Impact</h3>
                <p className="text-on-surface-variant mb-md">
                  Visualize your sustainability journey. See real-time metrics on money saved and the environmental CO2 impact you&apos;ve prevented.
                </p>
                <div className="flex gap-sm items-center">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-secondary flex items-center justify-center text-white material-symbols-outlined text-sm">
                      eco
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-primary flex items-center justify-center text-white material-symbols-outlined text-sm">
                      savings
                    </div>
                  </div>
                  <span className="font-label-md text-on-surface italic">Join 12,000+ local savers</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-2xl border border-outline-variant bg-[radial-gradient(circle_at_top_left,_rgba(215,215,207,0.6),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(255,219,204,0.5),_transparent_30%),#f6f3ed] p-xl md:p-24 mb-xl">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary-fixed-dim rounded-full mix-blend-multiply blur-3xl opacity-30" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-secondary-fixed-dim rounded-full mix-blend-multiply blur-3xl opacity-30" />
          <div className="relative z-10 text-center">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-lg">Start Your Digital Pantry Today</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl max-w-xl mx-auto">
              Turn your kitchen into a force for good. Sustainably managed food tastes better and feels better.
            </p>
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <button className="bg-primary text-on-primary px-xl py-lg rounded-full font-headline-md transition-all hover:scale-105 active:scale-95 shadow-md">
                Get Started for Free
              </button>
              <button className="bg-white border border-outline-variant text-primary px-xl py-lg rounded-full font-headline-md transition-all hover:bg-surface-container-low">
                View Community Map
              </button>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
