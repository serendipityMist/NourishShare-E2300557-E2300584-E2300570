import { useEffect, useMemo, useState } from 'react';
import AppLayout from '../components/layout/AppLayout.jsx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_SLOTS = ['Breakfast', 'Lunch', 'Dinner'];
const INVENTORY_OPTIONS = ['Basmati Rice', 'Coconut Milk', 'Tofu Puffs', 'Sambal Paste', 'Anchovies'];
const INITIAL_MEALS = [
  {
    id: 1,
    day: 'Tuesday',
    slot: 'Breakfast',
    dish: 'Nasi Lemak Special',
    items: ['Basmati Rice', 'Coconut Milk'],
    reminder: true,
    reminderTime: '60',
  },
];

export default function MealPlanner() {
  const [mealPlans, setMealPlans] = useState(INITIAL_MEALS);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentEditingId, setCurrentEditingId] = useState(null);
  const [currentSlot, setCurrentSlot] = useState('Breakfast');
  const [mealDay, setMealDay] = useState('Monday');
  const [dishName, setDishName] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [inventoryMenuOpen, setInventoryMenuOpen] = useState(false);
  const [reminderActive, setReminderActive] = useState(false);
  const [reminderTime, setReminderTime] = useState('60');
  const [toastMessage, setToastMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    if (!toastOpen) return;
    const timer = window.setTimeout(() => setToastOpen(false), 4000);
    return () => window.clearTimeout(timer);
  }, [toastOpen]);

  const filteredMeals = useMemo(() => {
    if (!search.trim()) return mealPlans;
    return mealPlans.filter((meal) => meal.dish.toLowerCase().includes(search.toLowerCase()));
  }, [mealPlans, search]);

  const mealCount = filteredMeals.length;
  const completion = mealCount ? Math.min(100, Math.round((mealCount / 21) * 100)) : 0;

  function openModal(day, slot, id = null) {
    const existing = mealPlans.find((meal) => meal.id === id);
    setCurrentEditingId(id);
    setMealDay(day);
    setCurrentSlot(slot);
    setInventoryMenuOpen(false);

    if (existing) {
      setDishName(existing.dish);
      setSelectedItems(existing.items);
      setReminderActive(existing.reminder);
      setReminderTime(existing.reminderTime);
    } else {
      setDishName('');
      setSelectedItems([]);
      setReminderActive(false);
      setReminderTime('60');
    }

    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setInventoryMenuOpen(false);
  }

  function saveMeal() {
    if (!dishName.trim()) {
      setToastMessage('Please enter a dish name.');
      setToastOpen(true);
      return;
    }

    const mealData = {
      id: currentEditingId || Date.now(),
      day: mealDay,
      slot: currentSlot,
      dish: dishName.trim(),
      items: selectedItems,
      reminder: reminderActive,
      reminderTime,
    };

    setMealPlans((prev) => {
      if (currentEditingId) {
        return prev.map((meal) => (meal.id === currentEditingId ? mealData : meal));
      }
      return [...prev, mealData];
    });

    setToastMessage(`Saved ${mealData.dish}`);
    setToastOpen(true);
    closeModal();
  }

  function deleteMeal() {
    setMealPlans((prev) => prev.filter((meal) => meal.id !== currentEditingId));
    setToastMessage('Meal deleted');
    setToastOpen(true);
    closeModal();
  }

  function toggleReminder() {
    setReminderActive((active) => !active);
  }

  function addInventoryItem(item) {
    setSelectedItems((prev) => (prev.includes(item) ? prev : [...prev, item]));
    setInventoryMenuOpen(false);
  }

  function removeInventoryItem(item) {
    setSelectedItems((prev) => prev.filter((i) => i !== item));
  }

  return (
    <AppLayout title="Meal Planner">
      <div className="mb-xl flex flex-col gap-lg">
        <div className="flex flex-col gap-lg lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-sm">
            <div className="flex flex-wrap items-center gap-md">
              <button className="p-sm hover:bg-surface-container rounded-full transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <h2 className="font-headline-lg text-headline-lg">October 23 – 29, 2023</h2>
              <button className="p-sm hover:bg-surface-container rounded-full transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
            <p className="text-on-surface-variant font-body-md italic">
              A nourishing week for the soul and the kitchen.
            </p>
          </div>

          <div className="flex flex-col gap-sm w-full max-w-xl">
            <div className="relative w-full max-w-md focus-within:ring-2 focus-within:ring-primary-container rounded-full overflow-hidden border border-outline-variant">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full py-2.5 pl-12 pr-4 bg-surface-container-low border-none focus:ring-0 text-sm"
                placeholder="Search meals..."
                type="text"
              />
            </div>
            <div className="flex flex-col gap-sm md:flex-row md:items-center md:justify-end md:gap-md">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-primary">Selamat Pagi, Farah!</span>
                <span className="text-xs text-on-surface-variant">{mealCount} meals planned this week</span>
              </div>
              <div className="flex items-center gap-4">
                <button className="material-symbols-outlined text-on-surface-variant hover:text-primary p-2 rounded-full">
                  notifications
                </button>
                <button className="material-symbols-outlined text-on-surface-variant hover:text-primary p-2 rounded-full">
                  account_circle
                </button>
                <button className="bg-primary text-on-primary px-6 py-2 rounded-full text-sm font-bold hover:opacity-90 active:scale-95 transition-all">
                  Impact Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="overflow-x-auto custom-scrollbar bg-surface-bright kraft-texture rounded-[32px] p-4">
        <div className="flex h-full min-w-max gap-4" id="calendar-grid">
          {DAYS.map((day, dayIndex) => (
            <div key={day} className="flex flex-col w-64 bg-white/60 backdrop-blur-sm rounded-lg border border-outline-variant p-2 gap-6 flex-shrink-0">
              <div className="px-2 py-1 border-b border-outline-variant/30 text-center">
                <span className="text-xs font-bold text-primary/70 block uppercase tracking-widest">{day.substring(0, 3)}</span>
                <span className="text-xl font-bold text-primary">{14 + dayIndex} Oct</span>
              </div>
              <div className="flex flex-col gap-6 flex-1">
                {MEAL_SLOTS.map((slot) => {
                  const meal = mealPlans.find((m) => m.day === day && m.slot === slot);
                  return (
                    <MealColumn
                      key={slot}
                      day={day}
                      slot={slot}
                      meal={meal}
                      onOpen={() => openModal(day, slot, meal?.id ?? null)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className={`fixed inset-0 z-50 flex items-center justify-center modal-backdrop transition-opacity duration-300 ${modalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`bg-white rounded-xl shadow-2xl max-w-4xl w-full flex overflow-hidden border border-outline-variant transform transition-transform duration-300 ${modalOpen ? 'scale-100' : 'scale-95'}`}>
          <div className="w-1/3 relative bg-surface-container overflow-hidden hidden md:block">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmAGqB_6nZUpNvhCA0-0xLD__eES7EuAwMWDQBwkw9LGC9M2Ge5kVJbFN6gS0zDdRIpeE3yTbLQxzOSmEW1BOWcQzkhURpwT2jjJGEqYf35n62aazo-Ojh3uuSq1FLbc7cDsXzexHwyWCpd19taOMObV89zhsJljW-cGCLKnpSSdjeBaq3WkfxdhPpriFnk0m-ZuZPJfdB5IoVa0qWu7SKHgloG5gh4Xb6ACIT2bzDB5d2riTzAtgF"
              alt="Nasi Lemak"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white pr-6">
              <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Pantry Select</p>
              <h3 className="text-2xl font-bold leading-tight">Seasonal Inspiration</h3>
            </div>
          </div>

          <div className="flex-1 p-8 flex flex-col gap-6 bg-surface-bright kraft-texture overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-3 py-0.5 rounded-full text-xs font-bold self-start">{currentEditingId ? 'EDIT MEAL' : 'PLAN MEAL'}</span>
                <h2 className="text-2xl font-bold text-on-surface">{currentEditingId ? 'Edit Meal' : 'Plan a Meal'}</h2>
              </div>
              <button className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors p-2" onClick={closeModal}>
                close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Scheduled Day</label>
                <select
                  value={mealDay}
                  onChange={(e) => setMealDay(e.target.value)}
                  className="rounded-lg border-outline-variant bg-surface-container-low text-sm focus:ring-primary focus:border-primary w-full px-4 py-2.5"
                >
                  {DAYS.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Meal Slot</label>
                <div className="flex rounded-lg overflow-hidden border border-outline-variant h-10">
                  {MEAL_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setCurrentSlot(slot)}
                      className={`flex-1 text-xs font-bold transition-colors ${currentSlot === slot ? 'bg-surface text-primary' : 'bg-transparent text-on-surface-variant'}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Dish Name</label>
              <input
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                className="rounded-lg border-outline-variant bg-surface-container-low text-sm focus:ring-primary focus:border-primary w-full px-4 py-2.5"
                placeholder="Enter dish name..."
                type="text"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Required Inventory Items</label>
              <div className="p-4 bg-surface-container rounded-lg border border-outline-variant/50">
                <div className="flex flex-wrap gap-2" id="inventoryTags">
                  {selectedItems.map((item) => (
                    <span key={item} className="flex items-center gap-1.5 bg-primary-fixed text-on-primary-fixed-variant px-3 py-1.5 rounded-sm text-xs font-bold">
                      {item}
                      <button type="button" className="material-symbols-outlined text-[14px]" onClick={() => removeInventoryItem(item)}>
                        close
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    className="border border-dashed border-outline-variant text-on-surface-variant px-3 py-1.5 rounded text-xs font-bold hover:bg-white transition-colors"
                    onClick={() => setInventoryMenuOpen((open) => !open)}
                  >
                    + Add Item
                  </button>
                </div>
                {inventoryMenuOpen && (
                  <div className="mt-3 p-2 bg-white rounded border border-outline-variant shadow-lg max-h-32 overflow-y-auto custom-scrollbar">
                    {INVENTORY_OPTIONS.map((item) => (
                      <div
                        key={item}
                        className="px-3 py-2 text-xs hover:bg-surface-container cursor-pointer"
                        onClick={() => addInventoryItem(item)}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-on-surface-variant/60 italic mt-3">
                  Linked items will be automatically deducted from inventory once meal is marked 'Cooked'.
                </p>
              </div>
            </div>

            <div className="bg-surface-container-low p-4 rounded-lg flex items-center justify-between border border-outline-variant/30">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-on-surface-variant p-2 bg-surface-variant rounded-full" id="reminderIcon">
                  notifications
                </span>
                <div>
                  <p className="text-xs font-bold">Meal Prep Reminder</p>
                  <p className="text-[11px] text-on-surface-variant">Notify me before starting</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-xs pr-8"
                >
                  <option value="30">30 mins before</option>
                  <option value="60">1 hour before</option>
                  <option value="120">2 hours before</option>
                </select>
                <button
                  type="button"
                  className={`w-10 h-6 rounded-full relative flex items-center px-1 transition-colors ${reminderActive ? 'bg-primary' : 'bg-outline-variant'}`}
                  onClick={toggleReminder}
                >
                  <span className={`w-4 h-4 bg-white rounded-full transition-transform ${reminderActive ? 'translate-x-4' : ''}`} />
                </button>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between pt-6 border-t border-outline-variant">
              <button
                type="button"
                className={`text-error text-xs font-bold flex items-center gap-1 hover:bg-error-container/20 px-3 py-2 rounded-lg transition-colors ${currentEditingId ? 'visible' : 'invisible'}`}
                onClick={deleteMeal}
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                Delete Meal
              </button>
              <div className="flex items-center gap-4">
                <button type="button" className="px-6 py-2.5 rounded-lg border border-outline text-on-surface-variant text-xs font-bold hover:bg-surface-variant transition-all" onClick={closeModal}>
                  Cancel
                </button>
                <button type="button" className="px-8 py-2.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all shadow-md" onClick={saveMeal}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toastOpen && (
        <div className="fixed bottom-6 right-6 bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 z-[100]">
          <span className="material-symbols-outlined text-primary-fixed">timer</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </AppLayout>
  );
}

function MealColumn({ day, slot, meal, onOpen }) {
  const hasMeal = Boolean(meal);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-tighter">{slot}</span>
        <button type="button" onClick={onOpen} className="material-symbols-outlined text-xs text-primary hover:bg-primary-container p-1 rounded-full active:scale-90 transition-all">
          add
        </button>
      </div>
      {hasMeal ? (
        <button type="button" onClick={onOpen} className="meal-card-hover group bg-white border border-outline-variant rounded-xl p-4 cursor-pointer transition-all text-left">
          <div className="flex flex-col gap-1">
            {meal.id === 1 && (
              <span className="bg-secondary-fixed text-on-secondary-fixed-variant text-[10px] font-bold px-2 py-0.5 rounded-full self-start mb-1 uppercase">
                KRAFT FAVORITE
              </span>
            )}
            <h4 className="text-sm text-on-surface leading-tight font-bold group-hover:text-primary">{meal.dish}</h4>
            <div className="flex flex-wrap gap-1 mt-2">
              {meal.items.map((item) => (
                <span key={item} className="flex items-center gap-1 bg-surface-container-high text-[10px] font-medium px-2 py-1 rounded-sm border border-outline-variant/50">
                  <span className="material-symbols-outlined text-[12px] text-primary">inventory_2</span>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </button>
      ) : (
        <button type="button" onClick={onOpen} className="border-2 border-dashed border-outline-variant/30 rounded-xl h-24 flex items-center justify-center group hover:border-primary/50 transition-colors cursor-pointer">
          <span className="text-xs font-bold uppercase text-on-surface-variant/40 group-hover:text-primary/60">Plan a Meal</span>
        </button>
      )}
    </div>
  );
}
