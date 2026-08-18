import { DEFAULT_REMINDER_TIME } from './constants.js';

/**
 * Initialize modal state with default values or existing meal data
 */
export const initializeModalState = (existingMeal = null, day = 'Monday', slot = 'Breakfast') => {
  if (existingMeal) {
    return {
      currentEditingId: existingMeal._id,
      mealDay: day,
      currentSlot: slot,
      dishName: existingMeal.mealName,
      selectedItems: existingMeal.food || [],
      reminderActive: existingMeal.reminderActive || false,
      reminderTime: String(existingMeal.reminderTime) || DEFAULT_REMINDER_TIME,
    };
  }

  return {
    currentEditingId: null,
    mealDay: day,
    currentSlot: slot,
    dishName: '',
    selectedItems: [],
    reminderActive: false,
    reminderTime: DEFAULT_REMINDER_TIME,
  };
};

/**
 * Reset modal state to default values
 */
export const getDefaultModalState = () => ({
  modalOpen: false,
  currentEditingId: null,
  currentSlot: 'Breakfast',
  mealDay: 'Monday',
  dishName: '',
  selectedItems: [],
  inventoryMenuOpen: false,
  reminderActive: false,
  reminderTime: DEFAULT_REMINDER_TIME,
  suggestions: [],
  selectedRecipe: null,
  recipeDetails: null,
  loadingSuggestions: false,
  recipeLoading: false,
});

/**
 * Validate dish name input
 */
export const validateDishName = (dishName) => {
  const trimmed = dishName.trim();
  if (!trimmed) {
    return { isValid: false, message: 'Please enter a dish name.' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, message: 'Dish name must be at least 2 characters.' };
  }
  if (trimmed.length > 100) {
    return { isValid: false, message: 'Dish name must be less than 100 characters.' };
  }
  return { isValid: true, message: '' };
};

/**
 * Build meal plan payload for API submission
 */
export const buildMealPayload = (
  dishName,
  selectedItems,
  mealDay,
  currentSlot,
  reminderActive,
  reminderTime,
  selectedRecipe = null,
  recipeDetails = null,
  suggestions = []
) => {
  return {
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
    reminderTime: Number(reminderTime),
  };
};

/**
 * Check if item is already selected
 */
export const isItemSelected = (item, selectedItems) => {
  return selectedItems.some((selected) => selected._id === item._id);
};

/**
 * Add item to selected items (avoid duplicates)
 */
export const addItemToSelection = (item, selectedItems) => {
  if (isItemSelected(item, selectedItems)) {
    return selectedItems;
  }
  return [...selectedItems, item];
};

/**
 * Remove item from selected items
 */
export const removeItemFromSelection = (itemId, selectedItems) => {
  return selectedItems.filter((item) => item._id !== itemId);
};

/**
 * Filter recipe suggestions by match count and limit
 */
export const filterRecipeSuggestions = (recipes, limit = 8) => {
  return recipes.slice(0, limit);
};

/**
 * Extract ingredients from recipe details
 */
export const extractIngredientsFromRecipe = (recipeDetails, maxIngredients = 20) => {
  return Array.from({ length: maxIngredients }, (_, index) => index + 1)
    .map((num) => ({
      ingredient: recipeDetails[`strIngredient${num}`],
      measure: recipeDetails[`strMeasure${num}`],
    }))
    .filter((item) => item.ingredient && item.ingredient.trim());
};

/**
 * Calculate meal plan completion percentage
 */
export const calculateCompletionPercentage = (mealCount, totalSlots) => {
  if (!mealCount) return 0;
  return Math.min(100, Math.round((mealCount / totalSlots) * 100));
};

/**
 * Build error message for toast notification
 */
export const getErrorMessage = (error, defaultMessage) => {
  return error?.response?.data?.message || defaultMessage;
};
