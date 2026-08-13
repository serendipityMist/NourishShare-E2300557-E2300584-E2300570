import { useEffect, useMemo, useState, useCallback } from 'react';
import AppLayout from '../components/layout/AppLayout.jsx';
import MealPlannerHeader from '../components/MealPlanner/MealPlannerHeader.jsx';
import MealPlannerGrid from '../components/MealPlanner/MealPlannerGrid.jsx';
import MealPlannerModal from '../components/MealPlanner/MealPlannerModal.jsx';
import { useInventory } from '../hooks/useInventory.js';
import { mealPlanService } from '../services/mealPlanService.js';
import { recipeService } from '../services/recipeService.js';
import { getExpiryStatus, daysUntil } from '../utils/dateUtils.js';

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
      <MealPlannerHeader
        search={search}
        onSearchChange={setSearch}
        expiringItems={expiringItems}
      />

      <MealPlannerGrid
        mealPlans={filteredMeals}
        onOpenModal={openModal}
      />

      <MealPlannerModal
        isOpen={modalOpen}
        isEditing={Boolean(currentEditingId)}
        mealDay={mealDay}
        currentSlot={currentSlot}
        dishName={dishName}
        selectedItems={selectedItems}
        inventoryMenuOpen={inventoryMenuOpen}
        reminderActive={reminderActive}
        reminderTime={reminderTime}
        suggestions={suggestions}
        selectedRecipe={selectedRecipe}
        recipeDetails={recipeDetails}
        loadingSuggestions={loadingSuggestions}
        recipeLoading={recipeLoading}
        activeItems={activeItems}
        onMealDayChange={setMealDay}
        onMealSlotChange={setCurrentSlot}
        onDishNameChange={setDishName}
        onFetchRecipeSuggestions={fetchRecipeSuggestions}
        onRecipeSelect={openRecipe}
        onAddInventoryItem={addInventoryItem}
        onRemoveInventoryItem={removeInventoryItem}
        onToggleInventoryMenu={setInventoryMenuOpen}
        onToggleReminder={toggleReminder}
        onReminderTimeChange={setReminderTime}
        onSave={saveMeal}
        onDelete={deleteMeal}
        onClose={closeModal}
      />

      {toastOpen && (
        <div className="fixed bottom-6 right-6 bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 z-[100]">
          <span className="material-symbols-outlined text-primary-fixed">timer</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </AppLayout>
  );
}