import { Link } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout.jsx';
import { useAuth } from '../hooks/useAuth';

export default function Features() {
  const { isAuthenticated } = useAuth();

  return (
    <PublicLayout>
      <main className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-xl space-y-xl">
        <section className="text-center space-y-md py-xl">
          <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-md py-xs font-label-md rounded-full">
            THE DIGITAL PANTRY
          </span>
          <h1 className="font-headline-xl text-headline-xl text-primary max-w-2xl mx-auto">
            Elevate your kitchen, nourish your community.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto">
            A modern companion for the Malaysian household, designed to reduce waste through heritage wisdom and smart technology.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-12 gap-lg items-stretch" id="inventory">
          <div className="md:col-span-7 bg-white border border-outline-variant rounded-xl p-lg space-y-lg flex flex-col justify-center overflow-hidden">
            <div className="space-y-sm">
              <span className="font-label-md text-primary uppercase tracking-widest">Digital Ledger</span>
              <h2 className="font-headline-lg text-headline-lg">Visual Inventory Management</h2>
              <p className="text-on-surface-variant">
                Categorize your staples with an interface inspired by heritage pantry ledgers. Easily track jars of spices, sacks of rice, and bottles of soy sauce with tactile clarity.
              </p>
            </div>
            <div className="ledger-line min-h-[200px] w-full mt-lg border-t border-outline-variant p-md">
              <div className="flex flex-wrap gap-md">
                <div className="pantry-sticker px-md py-sm flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary filled">spa</span>
                  <span className="font-label-md">Beras Wangi</span>
                </div>
                <div className="pantry-sticker px-md py-sm flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary filled">eco</span>
                  <span className="font-label-md">Serai</span>
                </div>
                <div className="pantry-sticker px-md py-sm flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary filled">local_dining</span>
                  <span className="font-label-md">Kicap Manis</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 h-[400px] md:h-auto rounded-xl overflow-hidden shadow-sm">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBQr9hT3fV48pVvte2-Vwogg2v2e7MtfYuye-vw6aTf0-1FCohZFw-FCbmQC1y_qmhjCk3Okr_GO2_ujTRg_Wrz2wWKtrSfrgl97b3XZsO7-c2fOzOSKlq6knVuIjrQsyKVkoNrwzTYeX4xVCrbgKa7O9xlNAxtXsnP5HS2eqTDu_mMBPglwDGPne0zI9vnTjHadqzkgbB0cJ1agDreAH8iqjYDqfhVWHpLIAQYui3mFDAebigyD6c')",
              }}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-xl py-xl items-center">
          <div className="relative order-2 md:order-1">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-tertiary-fixed rounded-full opacity-50 z-0" />
            <div className="pantry-sticker p-lg relative z-10 space-y-md">
              <div className="flex items-center gap-md border-b border-outline-variant pb-md">
                <span className="material-symbols-outlined text-secondary text-4xl">timer</span>
                <div>
                  <h3 className="font-headline-md text-headline-md">Smart Expiry Alerts</h3>
                  <p className="text-label-sm text-on-surface-variant">Active Reminders</p>
                </div>
              </div>
              <div className="space-y-md">
                <div className="flex justify-between items-center p-md bg-error-container rounded-lg">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-on-error-container">warning</span>
                    <span className="font-label-md text-on-error-container">Fresh Santan</span>
                  </div>
                  <span className="text-label-sm font-bold text-on-error-container">Expires Today</span>
                </div>
                <div className="flex justify-between items-center p-md bg-surface-container rounded-lg">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary">notifications</span>
                    <span className="font-label-md">Chili Padi</span>
                  </div>
                  <span className="text-label-sm text-on-surface-variant">3 Days Left</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-lg order-1 md:order-2">
            <span className="font-label-md text-secondary uppercase tracking-widest">The Kitchen Brain</span>
            <h2 className="font-headline-lg text-headline-lg">AI Meal Planner &amp; Smart Alerts</h2>
            <p className="font-body-lg text-on-surface-variant">
              Never let a perishable item go to waste again. Our AI understands the rhythm of Malaysian cooking, suggesting recipes based on your specific inventory and expiration dates.
            </p>
            <ul className="space-y-md">
              <li className="flex items-start gap-md">
                <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                <span>Personalized recipe suggestions using what you already have.</span>
              </li>
              <li className="flex items-start gap-md">
                <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                <span>Dynamic grocery lists that sync with your existing pantry.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="bg-surface-container-low rounded-2xl p-xl border border-outline-variant" id="marketplace">
          <div className="flex flex-col md:flex-row justify-between items-end gap-lg mb-xl">
            <div className="max-w-xl space-y-md">
              <span className="font-label-md text-primary uppercase tracking-widest">Got Extra? Share the Love</span>
              <h2 className="font-headline-lg text-headline-lg">Community Marketplace</h2>
              <p className="text-on-surface-variant">
                Join a network of neighbors reducing food waste. List surplus garden produce or pantry items you won't use, and claim treasures from others.
              </p>
            </div>
            <button className="bg-secondary text-on-secondary px-lg py-sm rounded-full font-label-md hover:opacity-90 transition-opacity">
              Browse Nearby Listings
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
            <div className="bg-white border border-outline-variant rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 relative">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBpNvCrX6B113SKpSmx40W1e3I3wojzDo_jbe3WeyR0Rm7r-56_Zzw3Cgb_uuRU2vpBi7ieuHOYx3d3N_nLlUiYhVxE5Cuv1OH2VRADvfcw_nZPoW57c7ppw3lXrfGy99qsxu_nY4x-dizqjHUl00sEy3QZQOh23FwqhKMyo9FLD5TlKkt6uX-w32A5XBrikgSjxXGaB8WKPhIHG_pE85dA7PVpm5BgYI6mJPchpkcftJLtED20bcs')",
                  }}
                />
                <span className="absolute top-md left-md bg-secondary text-white px-md py-xs rounded-full text-label-sm">Free</span>
              </div>
              <div className="p-md space-y-sm">
                <div className="flex justify-between items-start">
                  <h4 className="font-headline-md text-headline-md">Garden Limes</h4>
                  <span className="text-label-sm text-on-surface-variant">0.4km away</span>
                </div>
                <p className="text-on-surface-variant text-sm">
                  Harvested this morning. Too many for my family to use. Come pick some up!
                </p>
                <div className="flex items-center gap-sm pt-sm border-t border-outline-variant">
                  <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs">SK</div>
                  <span className="text-label-sm font-semibold">Siti K.</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-outline-variant rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 relative">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC6LPAasU52yp2mAi9bPBkkls8Gd1-XFxhjtjd4ODCb8icU1FkoGF2SW-zefqcpy6b5ltTnFrleiDVDJ9csDWOXqTCfmqFXIyYk6dnSf4HsC79nqV5aS9uu8MaAahOQffZWjIkEOL4OICgZOGISjqBtT-4ceKjjWmv-IeabcD3NPn7dfIVmcg0mvOAA9uao-tTCzdOB_LqJwt-iORFKPfKbaUlPcOqVHHxP_1VDnY0KEsyPKMgSgLY')",
                  }}
                />
                <span className="absolute top-md left-md bg-secondary text-white px-md py-xs rounded-full text-label-sm">Trade</span>
              </div>
              <div className="p-md space-y-sm">
                <div className="flex justify-between items-start">
                  <h4 className="font-headline-md text-headline-md">Ginger &amp; Lemongrass</h4>
                  <span className="text-label-sm text-on-surface-variant">1.2km away</span>
                </div>
                <p className="text-on-surface-variant text-sm">
                  Bundle of aromatics. Looking to trade for some fresh chili or curry leaves.
                </p>
                <div className="flex items-center gap-sm pt-sm border-t border-outline-variant">
                  <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary font-bold text-xs">RK</div>
                  <span className="text-label-sm font-semibold">Rajesh K.</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block bg-white border border-outline-variant rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 relative">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAguBKS6GOHuU4AUJOa0RdAtCD-9Fv69QjIWvefqe8PiYEPqzMH9yCRNXHrw9CQmM7dXHZvG3Vdq6dDRm4ARciYrUOKJo02KDWUBDn3sDwerR2zTaiaCBEZT-tubYNuVCbz0AaykWsnP7GlrT6FaRq034oqzzVL8wBvzEZX_9LeiNJ0DFgWD4CSwWhFLmEgJ7GPpSW50UWIW1bRe3XL4LZhehXBB30zsq0ueX9qBeCEF_e60fr396o')",
                  }}
                />
                <span className="absolute top-md left-md bg-secondary text-white px-md py-xs rounded-full text-label-sm">Free</span>
              </div>
              <div className="p-md space-y-sm">
                <div className="flex justify-between items-start">
                  <h4 className="font-headline-md text-headline-md">Homemade Sambal</h4>
                  <span className="text-label-sm text-on-surface-variant">0.8km away</span>
                </div>
                <p className="text-on-surface-variant text-sm">
                  Extra jar of my grandmother's recipe. No preservatives. Best consumed within a week.
                </p>
                <div className="flex items-center gap-sm pt-sm border-t border-outline-variant">
                  <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary font-bold text-xs">LW</div>
                  <span className="text-label-sm font-semibold">Lee W.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-xl py-xl">
          <div className="space-y-lg flex flex-col justify-center">
            <span className="font-label-md text-primary uppercase tracking-widest">Sustainability Dashboard</span>
            <h2 className="font-headline-lg text-headline-lg">Monitor Your Impact</h2>
            <p className="font-body-lg text-on-surface-variant">
              Every meal shared and every ingredient saved contributes to a better world. Visualize your contribution through local metrics that matter.
            </p>
            <div className="grid grid-cols-2 gap-md">
              <div className="p-lg bg-primary-container text-on-primary-container rounded-xl">
                <p className="text-label-sm uppercase opacity-80">Waste Saved</p>
                <p className="text-headline-lg">12.4kg</p>
              </div>
              <div className="p-lg bg-secondary-container text-on-secondary-container rounded-xl">
                <p className="text-label-sm uppercase opacity-80">CO2 Offset</p>
                <p className="text-headline-lg">31.2kg</p>
              </div>
            </div>
          </div>
          <div className="kraft-texture rounded-2xl p-xl flex items-center justify-center border border-outline-variant">
            <div className="w-full space-y-lg">
              <div className="flex justify-between items-center">
                <span className="font-label-md">Monthly Goal Progress</span>
                <span className="text-label-md font-bold">85%</span>
              </div>
              <div className="h-4 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '85%' }} />
              </div>
              <div className="pt-lg border-t border-outline-variant">
                <div className="flex items-center gap-md">
                  <div className="w-12 h-12 rounded-full bg-tertiary flex items-center justify-center text-white">
                    <span className="material-symbols-outlined">forest</span>
                  </div>
                  <div>
                    <p className="font-label-md">Community Ranking</p>
                    <p className="text-sm text-on-surface-variant">Top 5% in Bangsar area</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-primary text-on-primary rounded-3xl p-xl md:p-[64px] text-center space-y-lg overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div
              className="w-full h-full opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>
          <div className="relative z-10">
            <h2 className="font-headline-xl text-headline-xl max-w-2xl mx-auto">
              Ready to reduce your kitchen's footprint?
            </h2>
            <p className="font-body-lg text-primary-fixed max-w-lg mx-auto">
              Start your digital pantry today and join a growing movement of sustainable Malaysian households.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-md pt-lg">
              <button className="w-full sm:w-auto bg-secondary text-white px-xl py-md rounded-full font-label-md text-lg hover:shadow-lg transition-all active:scale-95">
                Download App
              </button>
              <button className="w-full sm:w-auto border border-primary-fixed-dim text-primary-fixed-dim px-xl py-md rounded-full font-label-md text-lg hover:bg-primary-container transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
