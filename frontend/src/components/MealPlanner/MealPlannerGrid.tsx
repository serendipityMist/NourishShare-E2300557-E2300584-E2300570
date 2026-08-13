import React from 'react';
import MealColumn from './MealColumn.tsx';
import { DAYS, MEAL_SLOTS } from './constants.ts';

import type { MealPlan, MealSlot, WeekDay } from './types.ts';

interface Props { mealPlans: MealPlan[]; onOpenModal: (day: WeekDay, slot: MealSlot, id?: string | null) => void; }

const MealPlannerGrid = ({ mealPlans, onOpenModal }: Props) => {
  const weekStart = new Date();
  const dayOffset = (weekStart.getDay() + 6) % 7;
  weekStart.setDate(weekStart.getDate() - dayOffset);

  return (
    <section aria-label="Weekly meal plan" className="overflow-x-auto custom-scrollbar bg-surface-bright kraft-texture rounded-[32px] p-4">
      <div className="flex h-full min-w-max gap-4" id="calendar-grid" role="list">
        {DAYS.map((day, dayIndex) => {
          const date = new Date(weekStart);
          date.setDate(weekStart.getDate() + dayIndex);
          const dateLabel = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' }).format(date);
          return (
          <div key={day} className="flex flex-col w-64 bg-white/60 backdrop-blur-sm rounded-lg border border-outline-variant p-2 gap-6 flex-shrink-0" role="listitem" aria-label={`${day}, ${dateLabel}`}>
            <div className="px-2 py-1 border-b border-outline-variant/30 text-center">
              <span className="text-xs font-bold text-primary/70 block uppercase tracking-widest">{day.substring(0, 3)}</span>
              <span className="text-xl font-bold text-primary">{dateLabel}</span>
            </div>
            <div className="flex flex-col gap-6 flex-1">
              {MEAL_SLOTS.map((slot) => {
                const meal = mealPlans.find((m) => m.day === day && m.mealType === slot);
                return (
                  <MealColumn
                    key={slot}
                    day={day}
                    slot={slot}
                    meal={meal}
              onOpen={() => onOpenModal(day as WeekDay, slot as MealSlot, meal?._id ?? null)}
                  />
                );
              })}
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
};

export default React.memo(MealPlannerGrid);
