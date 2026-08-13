import { useEffect, useMemo, useCallback } from 'react';
import AppLayout from '../components/layout/AppLayout.jsx';
import MealPlannerHeader from '../components/MealPlanner/MealPlannerHeader.jsx';
import MealPlannerGrid from '../components/MealPlanner/MealPlannerGrid.jsx';
import MealPlannerModal from '../components/MealPlanner/MealPlannerModal.jsx';
import { useInventory } from '../hooks/useInventory.js';
import { mealPlanService } from '../services/mealPlanService.js';
import { recipeService } from '../services/recipeService.js';
import { getExpiryStatus, daysUntil } from '../utils/dateUtils.js';
import { TOTAL_WEEKLY_SLOTS, MAX_SUGGESTIONS } from '../components/MealPlanner/constants.js';
import {
  validateDishName,
  buildMealPayload,
  calculateCompletionPercentage,
  getErrorMessage,
} from '../components/MealPlanner/mealPlannerUtils.js';
import { useMealPlannerState, ACTIONS } from '../components/MealPlanner/mealPlannerReducer.js';
import {
  retryWithBackoff,
  getDetailedErrorMessage,
  isRetryableError,
  logError,
} from '../components/MealPlanner/errorHandling.js';

export default function MealPlanner() {
  const { activeItems } = useInventory();
  const [state, dispatch] = useMealPlannerState();

  const { modal, recipe, ui, mealPlans } = state;

  // Toast auto-close effect
  useEffect(() => {
    if (!ui.toastOpen) return;
    const timer = window.setTimeout(() => {
      dispatch({ type: ACTIONS.HIDE_TOAST });
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [ui.toastOpen, dispatch]);

  // Fetch meal plans on mount
  useEffect(() => {
    fetchMealPlans();
  }, []);

  // Set expiring items when active items change
  useEffect(() => {
    const expiring = activeItems
      .filter((item) => getExpiryStatus(item.expiryDate) === 'expiring')
      .sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate))
      .slice(0, 5);
    dispatch({ type: ACTIONS.SET_EXPIRING_ITEMS, payload: expiring });
  }, [activeItems, dispatch]);

  async function fetchMealPlans() {
    try {
      const response = await retryWithBackoff(
        () => mealPlanService.getMyMealPlans(),
        3,
        1000
      );
      dispatch({ type: ACTIONS.SET_MEAL_PLANS, payload: response.data.data.mealPlans || [] });
    } catch (error) {
      const errorMsg = getDetailedErrorMessage(error, 'Failed to load meal plans. Please try again.');
      dispatch({ type: ACTIONS.SHOW_TOAST, payload: errorMsg });
      logError(error, 'fetchMealPlans');
      // Still set empty meal plans to allow UI to render
      dispatch({ type: ACTIONS.SET_MEAL_PLANS, payload: [] });
    }
  }

  const fetchRecipeSuggestions = useCallback(async () => {
    const selectedIngredientTokens = modal.selectedItems
      .flatMap((item) => item.name.split(/[,/()\s-]+/))
      .map((token) => token.trim().toLowerCase())
      .filter(Boolean);

    if (!selectedIngredientTokens.length) {
      dispatch({ type: ACTIONS.SET_SUGGESTIONS, payload: [] });
      return;
    }

    const searchTerms = Array.from(new Set(selectedIngredientTokens));
    dispatch({ type: ACTIONS.SET_LOADING_SUGGESTIONS, payload: true });

    try {
      const responses = await Promise.all(
        searchTerms.map((term) =>
          retryWithBackoff(
            () => recipeService.findByIngredient(term),
            2,
            800
          ).catch(() => ({ data: { meals: [] } }))
        )
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
          .slice(0, MAX_SUGGESTIONS);
      }

      if (!finalMeals.length && modal.dishName.trim()) {
        try {
          const response = await retryWithBackoff(
            () => recipeService.searchByName(modal.dishName.trim()),
            2,
            800
          );
          finalMeals = response.data.meals || [];
        } catch (searchError) {
          logError(searchError, 'fetchRecipeSuggestions - dish name search');
          // Silently fail on dish name search, just show what we have
        }
      }

      dispatch({ type: ACTIONS.SET_SUGGESTIONS, payload: finalMeals.slice(0, MAX_SUGGESTIONS) });
    } catch (error) {
      logError(error, 'fetchRecipeSuggestions');
      dispatch({ type: ACTIONS.SHOW_TOAST, payload: 'Unable to load recipe suggestions. Try selecting different ingredients.' });
      dispatch({ type: ACTIONS.SET_SUGGESTIONS, payload: [] });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING_SUGGESTIONS, payload: false });
    }
  }, [modal.selectedItems, modal.dishName, dispatch]);

  const openRecipe = useCallback(async (recipeData) => {
    dispatch({ type: ACTIONS.SELECT_RECIPE, payload: recipeData });
    dispatch({ type: ACTIONS.SET_RECIPE_LOADING, payload: true });

    try {
      const response = await retryWithBackoff(
        () => recipeService.getById(recipeData.idMeal),
        2,
        800
      );
      const details = response.data.meals?.[0] || null;
      if (!details) {
        throw new Error('Recipe details not found');
      }
      dispatch({ type: ACTIONS.SET_RECIPE_DETAILS, payload: details });
    } catch (error) {
      const errorMsg = getDetailedErrorMessage(error, 'Failed to load recipe details. Please try again.');
      dispatch({ type: ACTIONS.SHOW_TOAST, payload: errorMsg });
      logError(error, 'openRecipe');
      dispatch({ type: ACTIONS.SET_RECIPE_DETAILS, payload: null });
    } finally {
      dispatch({ type: ACTIONS.SET_RECIPE_LOADING, payload: false });
    }
  }, [dispatch]);

  // Memoized filtered meals
  const filteredMeals = useMemo(() => {
    if (!modal.dishName.trim()) return mealPlans;
    const searchTerm = modal.dishName.toLowerCase();
    return mealPlans.filter((meal) =>
      meal.mealName.toLowerCase().includes(searchTerm)
    );
  }, [mealPlans, modal.dishName]);

  // Memoized completion percentage
  const completion = useMemo(
    () => calculateCompletionPercentage(filteredMeals.length, TOTAL_WEEKLY_SLOTS),
    [filteredMeals.length]
  );

  // Memoized callback handlers
  const handleOpenModal = useCallback((day, slot, id = null) => {
    const existing = mealPlans.find((meal) => meal._id === id);
    dispatch({
      type: ACTIONS.OPEN_MODAL,
      payload: {
        editingId: id,
        day,
        slot,
        dishName: existing?.mealName || '',
        selectedItems: existing?.food || [],
        reminderActive: existing?.reminderActive || false,
        reminderTime: String(existing?.reminderTime) || '60',
      },
    });
  }, [mealPlans, dispatch]);

  const handleCloseModal = useCallback(() => {
    dispatch({ type: ACTIONS.CLOSE_MODAL });
  }, [dispatch]);

  const handleSaveMeal = useCallback(async () => {
    const validation = validateDishName(modal.dishName);
    if (!validation.isValid) {
      dispatch({ type: ACTIONS.SHOW_TOAST, payload: validation.message });
      return;
    }

    const payload = buildMealPayload(
      modal.dishName,
      modal.selectedItems,
      modal.mealDay,
      modal.currentSlot,
      modal.reminderActive,
      modal.reminderTime,
      recipe.selectedRecipe,
      recipe.recipeDetails,
      recipe.suggestions
    );

    try {
      const response = await retryWithBackoff(
        () => mealPlanService.addMealPlanEntry(payload),
        3,
        1000
      );
      const savedPlan = response.data.data.mealPlan;

      if (!savedPlan._id) {
        throw new Error('Invalid meal plan response from server');
      }

      if (modal.currentEditingId) {
        dispatch({ type: ACTIONS.UPDATE_MEAL_PLAN, payload: savedPlan });
      } else {
        dispatch({ type: ACTIONS.ADD_MEAL_PLAN, payload: savedPlan });
      }

      dispatch({ type: ACTIONS.SHOW_TOAST, payload: `✓ Saved ${savedPlan.mealName}` });
      handleCloseModal();
    } catch (error) {
      const errorMsg = getDetailedErrorMessage(
        error,
        'Unable to save meal plan. Please try again.'
      );
      dispatch({ type: ACTIONS.SHOW_TOAST, payload: errorMsg });
      logError(error, 'handleSaveMeal');

      // Store error state for potential retry
      if (isRetryableError(error)) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: { message: errorMsg, context: 'save', payload } });
      }
    }
  }, [modal, recipe, dispatch, handleCloseModal]);

  const handleDeleteMeal = useCallback(async () => {
    if (!modal.currentEditingId) {
      dispatch({ type: ACTIONS.SHOW_TOAST, payload: 'Unable to remove meal - no meal selected' });
      return;
    }

    try {
      await retryWithBackoff(
        () => mealPlanService.deleteMealPlanEntry(modal.currentEditingId),
        3,
        1000
      );
      dispatch({ type: ACTIONS.DELETE_MEAL_PLAN, payload: modal.currentEditingId });
      dispatch({ type: ACTIONS.SHOW_TOAST, payload: '✓ Meal removed' });
      handleCloseModal();
    } catch (error) {
      const errorMsg = getDetailedErrorMessage(
        error,
        'Unable to delete meal plan. Please try again.'
      );
      dispatch({ type: ACTIONS.SHOW_TOAST, payload: errorMsg });
      logError(error, 'handleDeleteMeal');

      // Store error state for potential retry
      if (isRetryableError(error)) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: { message: errorMsg, context: 'delete', mealId: modal.currentEditingId } });
      }
    }
  }, [modal.currentEditingId, dispatch, handleCloseModal]);

  const handleAddInventoryItem = useCallback((item) => {
    dispatch({ type: ACTIONS.ADD_ITEM, payload: item });
  }, [dispatch]);

  const handleRemoveInventoryItem = useCallback((itemId) => {
    dispatch({ type: ACTIONS.REMOVE_ITEM, payload: itemId });
  }, [dispatch]);

  const handleToggleReminder = useCallback(() => {
    dispatch({ type: ACTIONS.SET_REMINDER_ACTIVE, payload: !modal.reminderActive });
  }, [modal.reminderActive, dispatch]);

  return (
    <AppLayout title="Meal Planner">
      <MealPlannerHeader
        search={modal.dishName}
        onSearchChange={(value) => dispatch({ type: ACTIONS.SET_DISH_NAME, payload: value })}
        expiringItems={ui.expiringItems}
      />

      <MealPlannerGrid
        mealPlans={filteredMeals}
        onOpenModal={handleOpenModal}
      />

      <MealPlannerModal
        isOpen={modal.modalOpen}
        isEditing={Boolean(modal.currentEditingId)}
        mealDay={modal.mealDay}
        currentSlot={modal.currentSlot}
        dishName={modal.dishName}
        selectedItems={modal.selectedItems}
        inventoryMenuOpen={modal.inventoryMenuOpen}
        reminderActive={modal.reminderActive}
        reminderTime={modal.reminderTime}
        suggestions={recipe.suggestions}
        selectedRecipe={recipe.selectedRecipe}
        recipeDetails={recipe.recipeDetails}
        loadingSuggestions={recipe.loadingSuggestions}
        recipeLoading={recipe.recipeLoading}
        activeItems={activeItems}
        onMealDayChange={(value) => dispatch({ type: ACTIONS.SET_MEAL_DAY, payload: value })}
        onMealSlotChange={(value) => dispatch({ type: ACTIONS.SET_MEAL_SLOT, payload: value })}
        onDishNameChange={(value) => dispatch({ type: ACTIONS.SET_DISH_NAME, payload: value })}
        onFetchRecipeSuggestions={fetchRecipeSuggestions}
        onRecipeSelect={openRecipe}
        onAddInventoryItem={handleAddInventoryItem}
        onRemoveInventoryItem={handleRemoveInventoryItem}
        onToggleInventoryMenu={(value) => dispatch({ type: ACTIONS.TOGGLE_INVENTORY_MENU, payload: value })}
        onToggleReminder={handleToggleReminder}
        onReminderTimeChange={(value) => dispatch({ type: ACTIONS.SET_REMINDER_TIME, payload: value })}
        onSave={handleSaveMeal}
        onDelete={handleDeleteMeal}
        onClose={handleCloseModal}
      />

      {ui.toastOpen && (
        <div role="status" aria-live="polite" className="fixed bottom-6 right-6 bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 z-[100]">
          <span aria-hidden="true" className="material-symbols-outlined text-primary-fixed">timer</span>
          <span>{ui.toastMessage}</span>
        </div>
      )}
    </AppLayout>
  );
}
