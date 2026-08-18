import { useEffect, useMemo, useRef, useState } from 'react';
import AppLayout from '../components/layout/AppLayout.jsx';
import { useInventory } from '../hooks/useInventory.js';
import { mealPlanService } from '../services/mealPlanService.js';
import { recipeService } from '../services/recipeService.js';
import { getExpiryStatus, daysUntil } from '../utils/dateUtils.js';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_SLOTS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function MealPlanner() {
  const { activeItems } = useInventory();
  const [mealPlans, setMealPlans] = useState([]);
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
  const [suggestions, setSuggestions] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipeDetails, setRecipeDetails] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [expiringItems, setExpiringItems] = useState([]);

  // FIX: guards the initial fetchMealPlans() GET from overwriting
  // state with stale data if a save/delete already completed first.
  const hasMutatedRef = useRef(false);

  useEffect(() => {
    if (!toastOpen) return;
    const timer = window.setTimeout(() => setToastOpen(false), 4000);
    return () => window.clearTimeout(timer);
  }, [toastOpen]);

  useEffect(() => {
    setExpiringItems(
      activeItems
        .filter((item) => getExpiryStatus(item.expiryDate) === 'expiring')
        .sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate))
        .slice(0, 5)
    );
  }, [activeItems]);

  useEffect(() => {
    fetchMealPlans();
  }, []);

  async function fetchMealPlans() {
    try {
      const response = await mealPlanService.getMyMealPlans();

      // FIX: if a save or delete has already landed since this GET
      // was fired, don't clobber that fresher state with this stale
      // snapshot from before the mutation happened.
      if (hasMutatedRef.current) return;

      setMealPlans(response.data.data.mealPlans || []);
    } catch (error) {
      console.error('Failed to fetch meal plans', error);
    }
  }

  async function fetchRecipeSuggestions() {
    const selectedIngredientTokens = selectedItems
      .flatMap((item) => item.name.split(/[,/()\s-]+/))
      .map((token) => token.trim().toLowerCase())
      .filter(Boolean);

    if (!selectedIngredientTokens.length) {
      setSuggestions([]);
      return;
    }

    const searchTerms = Array.from(new Set(selectedIngredientTokens));
    setLoadingSuggestions(true);

    try {
      const responses = await Promise.all(
        searchTerms.map((term) => recipeService.findByIngredient(term).catch(() => ({ data: { meals: [] } })))
      );

      const mealsByTerm = responses.map((response) => response.data.meals || []);
      const intersection = mealsByTerm.reduce((common, meals) => {
        if (!common) return meals;
        return common.filter((meal) => meals.some((next) => next.idMeal === meal.idMeal));
      }, null);

      const matchedMeals = (intersection && intersection.length ? intersection : []) || [];
      let finalMeals = matchedMeals;

      if (!finalMeals.length) {
        const mealMap = {};
        mealsByTerm.flat().forEach((recipe) => {
          if (!recipe.idMeal) return;
          if (!mealMap[recipe.idMeal]) {
            mealMap[recipe.idMeal] = { ...recipe, matchCount: 0 };
          }
          mealMap[recipe.idMeal].matchCount += 1;
        });

        finalMeals = Object.values(mealMap)
          .sort((a, b) => b.matchCount - a.matchCount)
          .slice(0, 8);
      }

      if (!finalMeals.length && dishName.trim()) {
        const response = await recipeService.searchByName(dishName.trim());
        finalMeals = response.data.meals || [];
      }

      setSuggestions(finalMeals.slice(0, 8));
    } catch (error) {
      console.error('Recipe suggestions failed', error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  async function openRecipe(recipe) {
    setSelectedRecipe(recipe);
    setDishName(recipe.strMeal);

    setRecipeLoading(true);
    try {
      const response = await recipeService.getById(recipe.idMeal);
      const details = response.data.meals?.[0] || null;
      setRecipeDetails(details);
    } catch (error) {
      console.error('Failed to load recipe details', error);
      setRecipeDetails(null);
    } finally {
      setRecipeLoading(false);
    }
  }

  const filteredMeals = useMemo(() => {
    if (!search.trim()) return mealPlans;
    return mealPlans.filter((meal) => meal.mealName.toLowerCase().includes(search.toLowerCase()));
  }, [mealPlans, search]);

  const mealCount = filteredMeals.length;
  const completion = mealCount ? Math.min(100, Math.round((mealCount / (DAYS.length * MEAL_SLOTS.length)) * 100)) : 0;

  function openModal(day, slot, id = null) {
    const existing = mealPlans.find((meal) => meal._id === id);
    setCurrentEditingId(id);
    setMealDay(day);
    setCurrentSlot(slot);
    setInventoryMenuOpen(false);

    if (existing) {
      setDishName(existing.mealName);
      setSelectedItems(existing.food || []);
      setReminderActive(false);
      setReminderTime('60');
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

  async function saveMeal() {
    if (!dishName.trim()) {
      setToastMessage('Please enter a dish name.');
      setToastOpen(true);
      return;
    }

    const payload = {
      foodIds: selectedItems.map((item) => item._id),
      day: mealDay,
      mealType: currentSlot,
      mealName: dishName.trim(),
      mealImage:
        selectedRecipe?.strMealThumb ||
        recipeDetails?.strMealThumb ||
        suggestions?.[0]?.strMealThumb ||
        '',
      reminderActive,
      reminderTime: Number(reminderTime)
    };

    try {
      const response = await mealPlanService.addMealPlanEntry(payload);
      const savedPlan = response.data.data.mealPlan;

      // FIX: mark that a mutation has happened so the initial
      // fetchMealPlans() GET (if still in flight) won't overwrite
      // this with stale pre-save data.
      hasMutatedRef.current = true;

      setMealPlans((prev) => {
        if (currentEditingId) {
          return prev.map((meal) => (meal._id === currentEditingId ? savedPlan : meal));
        }
        return [...prev, savedPlan];
      });

      setToastMessage(`Saved ${savedPlan.mealName}`);
      setToastOpen(true);
      closeModal();
    } catch (error) {
      console.error('Failed to save meal plan', error);
      setToastMessage(error.response?.data?.message || 'Unable to save meal plan');
      setToastOpen(true);
    }
  }

  async function deleteMeal() {
    if (!currentEditingId) {
      setToastMessage('Unable to remove meal');
      setToastOpen(true);
      return;
    }

    try {
      await mealPlanService.deleteMealPlanEntry(currentEditingId);

      // FIX: same guard as saveMeal() — a delete counts as a mutation too.
      hasMutatedRef.current = true;

      setMealPlans((prev) => prev.filter((meal) => meal._id !== currentEditingId));
      setToastMessage('Meal removed');
      setToastOpen(true);
      closeModal();
    } catch (error) {
      console.error('Failed to delete meal plan', error);
      setToastMessage(error.response?.data?.message || 'Unable to delete meal plan');
      setToastOpen(true);
    }
  }

  function toggleReminder() {
    setReminderActive((active) => !active);
  }

  function addInventoryItem(item) {
    setSelectedItems((prev) => (prev.some((selected) => selected._id === item._id) ? prev : [...prev, item]));
    setInventoryMenuOpen(false);
  }

  function removeInventoryItem(itemId) {
    setSelectedItems((prev) => prev.filter((item) => item._id !== itemId));
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
              <h2 className="font-headline-lg text-headline-lg">Weekly Meal Planner</h2>
              <button className="p-sm hover:bg-surface-container rounded-full transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
            <p className="text-on-surface-variant font-body-md italic">
              Build your week using expiring ingredients and smart recipe suggestions.
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
                  const meal = mealPlans.find((m) => m.day === day && m.mealType === slot);
                  return (
                    <MealColumn
                      key={slot}
                      day={day}
                      slot={slot}
                      meal={meal}
                      onOpen={() => openModal(day, slot, meal?._id ?? null)}
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
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80"
              alt="Meal planning"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white pr-6">
              <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Pantry First</p>
              <h3 className="text-2xl font-bold leading-tight">Plan using items ready to cook</h3>
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
                    <span key={item._id} className="flex items-center gap-1.5 bg-primary-fixed text-on-primary-fixed-variant px-3 py-1.5 rounded-sm text-xs font-bold">
                      {item.name}
                      <button type="button" className="material-symbols-outlined text-[14px]" onClick={() => removeInventoryItem(item._id)}>
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
                  <div className="mt-3 p-2 bg-white rounded border border-outline-variant shadow-lg max-h-44 overflow-y-auto custom-scrollbar">
                    {activeItems.length ? (
                      activeItems.map((item) => (
                        <div
                          key={item._id}
                          className="px-3 py-2 text-xs hover:bg-surface-container cursor-pointer"
                          onClick={() => addInventoryItem(item)}
                        >
                          {item.name}
                          <span className="text-[11px] text-on-surface-variant ml-2">({getExpiryStatus(item.expiryDate)})</span>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-xs text-on-surface-variant">No active inventory items available.</div>
                    )}
                  </div>
                )}

                <div className="mt-3 flex flex-col gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-secondary text-on-secondary text-xs font-bold hover:bg-secondary-container transition-all"
                    onClick={fetchRecipeSuggestions}
                    disabled={!selectedItems.length}
                  >
                    {loadingSuggestions ? 'Finding recipes…' : 'Suggest recipes from selected ingredients'}
                  </button>
                  <p className="text-[10px] text-on-surface-variant/60 italic">
                    Select expiring ingredients and get free recipe suggestions.
                  </p>
                </div>
              </div>
            </div>

            {suggestions.length > 0 && (
              <div className="rounded-3xl bg-surface-container p-4 border border-outline-variant">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Recipe ideas</p>
                    <p className="font-semibold">Suggested recipes</p>
                  </div>
                  <span className="text-[11px] text-on-surface-variant">Choose one to plan quickly.</span>
                </div>
                <div className="mt-4 grid gap-3">
                  {suggestions.slice(0, 4).map((recipe) => (
                    <button
                      key={recipe.idMeal}
                      type="button"
                      className="w-full rounded-2xl border border-outline-variant p-3 text-left hover:bg-surface-container-high transition"
                      onClick={() => openRecipe(recipe)}
                    >
                      <div className="flex items-center gap-3">
                        <img src={recipe.strMealThumb} alt={recipe.strMeal} className="w-14 h-14 rounded-2xl object-cover" />
                        <div>
                          <p className="font-semibold">{recipe.strMeal}</p>
                          <p className="text-[11px] text-on-surface-variant">Ingredients matched from your inventory.</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedRecipe && (
              <div className="rounded-3xl bg-surface-container p-4 border border-outline-variant">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Recipe details</p>
                    <p className="font-semibold">{selectedRecipe.strMeal}</p>
                  </div>
                  <span className="text-[11px] text-on-surface-variant">Steps and ingredients provided by TheMealDB.</span>
                </div>
                <div className="mt-4 grid gap-4">
                  {recipeLoading ? (
                    <div className="text-sm text-on-surface-variant">Loading recipe details…</div>
                  ) : recipeDetails ? (
                    <>
                      <div className="grid gap-2">
                        <p className="text-sm font-semibold">Instructions</p>
                        <p className="text-sm leading-6 text-on-surface-variant whitespace-pre-line">{recipeDetails.strInstructions}</p>
                      </div>

                      <div className="grid gap-2">
                        <p className="text-sm font-semibold">Ingredients</p>
                        <div className="flex flex-wrap gap-2">
                          {Array.from({ length: 20 }, (_, index) => index + 1)
                            .map((num) => ({
                              ingredient: recipeDetails[`strIngredient${num}`],
                              measure: recipeDetails[`strMeasure${num}`],
                            }))
                            .filter((item) => item.ingredient)
                            .map((item, idx) => (
                              <span key={idx} className="rounded-full bg-surface-container-high px-3 py-1 text-[11px] text-on-surface-variant">
                                {item.ingredient.trim()} {item.measure?.trim()}
                              </span>
                            ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-on-surface-variant">Select a recipe to see instructions.</p>
                  )}
                </div>
              </div>
            )}

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
        <button type="button" onClick={onOpen} className="meal-card-hover group bg-white border border-outline-variant rounded-xl p-0 cursor-pointer transition-all text-left overflow-hidden">
          <div className="relative h-28 overflow-hidden bg-surface-container-high">
            {meal.mealImage ? (
              <img
                src={meal.mealImage}
                alt={meal.mealName}
                className="w-full h-full object-cover"
              />
            ) : meal.food?.[0]?.foodImage ? (
              <img
                src={meal.food[0].foodImage}
                alt={meal.mealName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-on-surface-variant text-xs uppercase tracking-[0.2em]">No image available</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-surface/40 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 p-2 bg-surface/80 rounded-2xl">
              <h4 className="text-sm text-on-surface leading-tight font-bold group-hover:text-primary">{meal.mealName}</h4>
            </div>
          </div>
          <div className="p-3 space-y-3">
            <div className="flex flex-wrap gap-2">
              {(meal.food || []).map((item) => (
                <span key={item._id} className="flex items-center gap-1 bg-surface-container-high text-[10px] font-medium px-2 py-1 rounded-sm border border-outline-variant/50">
                  <span className="material-symbols-outlined text-[12px] text-primary">inventory_2</span>
                  {item.name}
                </span>
              ))}
            </div>
            <div className="flex -space-x-2 overflow-hidden">
              {(meal.food || [])
                .filter((item) => item.foodImage)
                .slice(0, 4)
                .map((item) => (
                  <img
                    key={item._id}
                    src={item.foodImage}
                    alt={item.name}
                    className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
                  />
                ))}
              {(meal.food || []).filter((item) => item.foodImage).length > 4 && (
                <span className="flex h-10 min-w-[2.5rem] items-center justify-center rounded-full border-2 border-white bg-surface text-[11px] font-semibold text-on-surface-variant shadow-sm">
                  +{(meal.food || []).filter((item) => item.foodImage).length - 4}
                </span>
              )}
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