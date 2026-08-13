import React from 'react';
import { daysUntil, getExpiryStatus } from '../../utils/dateUtils.js';

const MealPlannerHeader = ({
  search,
  onSearchChange,
  expiringItems,
}) => {
  return (
    <div className="mb-xl flex flex-col gap-lg">
      <div className="flex flex-col gap-lg lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-sm">
          <div className="flex flex-wrap items-center gap-md">
            <button type="button" aria-label="View previous week" className="p-sm hover:bg-surface-container rounded-full transition-colors">
              <span aria-hidden="true" className="material-symbols-outlined">chevron_left</span>
            </button>
            <h2 className="font-headline-lg text-headline-lg">Weekly Meal Planner</h2>
            <button type="button" aria-label="View next week" className="p-sm hover:bg-surface-container rounded-full transition-colors">
              <span aria-hidden="true" className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          <p className="text-on-surface-variant font-body-md italic">
            Build your week using expiring ingredients and smart recipe suggestions.
          </p>
        </div>

        <div className="flex flex-col gap-sm w-full max-w-xl">
          <div className="relative w-full max-w-md focus-within:ring-2 focus-within:ring-primary-container rounded-full overflow-hidden border border-outline-variant">
            <span aria-hidden="true" className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              aria-label="Search planned meals"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full py-2.5 pl-12 pr-4 bg-surface-container-low border-none focus:ring-0 text-sm"
              placeholder="Search meals..."
              type="text"
            />
          </div>
          <div className="rounded-3xl bg-surface-container p-4 border border-outline-variant">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Expiring Soon</p>
                <p className="font-bold">{expiringItems.length} items near expiry</p>
              </div>
              <div className="text-right text-[11px] text-on-surface-variant">
                Use these items first to reduce waste.
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3">
              {expiringItems.length > 0 ? (
                expiringItems.map((item) => (
                  <div key={item._id} className="rounded-2xl bg-white/90 border border-outline-variant p-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-[11px] text-on-surface-variant">Expires in {daysUntil(item.expiryDate)} days</p>
                    </div>
                    <span className="rounded-full bg-warning-container px-3 py-1 text-[11px] text-warning">Expiring</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-on-surface-variant">No expiring items found. Add more inventory to get suggestions.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MealPlannerHeader);
