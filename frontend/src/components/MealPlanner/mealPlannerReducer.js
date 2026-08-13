import { useReducer } from 'react';
import { DEFAULT_REMINDER_TIME } from './constants.js';

const initialModalState = {
  modalOpen: false,
  currentEditingId: null,
  currentSlot: 'Breakfast',
  mealDay: 'Monday',
  dishName: '',
  selectedItems: [],
  inventoryMenuOpen: false,
  reminderActive: false,
  reminderTime: DEFAULT_REMINDER_TIME,
};

const initialRecipeState = {
  suggestions: [],
  selectedRecipe: null,
  recipeDetails: null,
  loadingSuggestions: false,
  recipeLoading: false,
};

const initialUIState = {
  toastOpen: false,
  toastMessage: '',
  expiringItems: [],
};

export const initialState = {
  modal: initialModalState,
  recipe: initialRecipeState,
  ui: initialUIState,
  mealPlans: [],
};

export const ACTIONS = {
  // Modal actions
  OPEN_MODAL: 'OPEN_MODAL',
  CLOSE_MODAL: 'CLOSE_MODAL',
  SET_MEAL_DAY: 'SET_MEAL_DAY',
  SET_MEAL_SLOT: 'SET_MEAL_SLOT',
  SET_DISH_NAME: 'SET_DISH_NAME',
  SET_SELECTED_ITEMS: 'SET_SELECTED_ITEMS',
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  TOGGLE_INVENTORY_MENU: 'TOGGLE_INVENTORY_MENU',
  SET_REMINDER_ACTIVE: 'SET_REMINDER_ACTIVE',
  SET_REMINDER_TIME: 'SET_REMINDER_TIME',
  RESET_MODAL: 'RESET_MODAL',

  // Recipe actions
  SET_SUGGESTIONS: 'SET_SUGGESTIONS',
  SET_LOADING_SUGGESTIONS: 'SET_LOADING_SUGGESTIONS',
  SELECT_RECIPE: 'SELECT_RECIPE',
  SET_RECIPE_DETAILS: 'SET_RECIPE_DETAILS',
  SET_RECIPE_LOADING: 'SET_RECIPE_LOADING',
  RESET_RECIPE: 'RESET_RECIPE',

  // UI actions
  SHOW_TOAST: 'SHOW_TOAST',
  HIDE_TOAST: 'HIDE_TOAST',
  SET_EXPIRING_ITEMS: 'SET_EXPIRING_ITEMS',

  // Meal plans actions
  SET_MEAL_PLANS: 'SET_MEAL_PLANS',
  ADD_MEAL_PLAN: 'ADD_MEAL_PLAN',
  UPDATE_MEAL_PLAN: 'UPDATE_MEAL_PLAN',
  DELETE_MEAL_PLAN: 'DELETE_MEAL_PLAN',
};

export function mealPlannerReducer(state, action) {
  switch (action.type) {
    // Modal actions
    case ACTIONS.OPEN_MODAL:
      return {
        ...state,
        modal: {
          ...state.modal,
          modalOpen: true,
          currentEditingId: action.payload.editingId || null,
          mealDay: action.payload.day || 'Monday',
          currentSlot: action.payload.slot || 'Breakfast',
          dishName: action.payload.dishName || '',
          selectedItems: action.payload.selectedItems || [],
          reminderActive: action.payload.reminderActive || false,
          reminderTime: action.payload.reminderTime || DEFAULT_REMINDER_TIME,
        },
      };

    case ACTIONS.CLOSE_MODAL:
      return {
        ...state,
        modal: initialModalState,
        recipe: initialRecipeState,
      };

    case ACTIONS.SET_MEAL_DAY:
      return {
        ...state,
        modal: { ...state.modal, mealDay: action.payload },
      };

    case ACTIONS.SET_MEAL_SLOT:
      return {
        ...state,
        modal: { ...state.modal, currentSlot: action.payload },
      };

    case ACTIONS.SET_DISH_NAME:
      return {
        ...state,
        modal: { ...state.modal, dishName: action.payload },
      };

    case ACTIONS.SET_SELECTED_ITEMS:
      return {
        ...state,
        modal: { ...state.modal, selectedItems: action.payload },
      };

    case ACTIONS.ADD_ITEM:
      return {
        ...state,
        modal: {
          ...state.modal,
          selectedItems: [...state.modal.selectedItems, action.payload],
          inventoryMenuOpen: false,
        },
      };

    case ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        modal: {
          ...state.modal,
          selectedItems: state.modal.selectedItems.filter((item) => item._id !== action.payload),
        },
      };

    case ACTIONS.TOGGLE_INVENTORY_MENU:
      return {
        ...state,
        modal: { ...state.modal, inventoryMenuOpen: action.payload },
      };

    case ACTIONS.SET_REMINDER_ACTIVE:
      return {
        ...state,
        modal: { ...state.modal, reminderActive: action.payload },
      };

    case ACTIONS.SET_REMINDER_TIME:
      return {
        ...state,
        modal: { ...state.modal, reminderTime: action.payload },
      };

    case ACTIONS.RESET_MODAL:
      return {
        ...state,
        modal: initialModalState,
        recipe: initialRecipeState,
      };

    // Recipe actions
    case ACTIONS.SET_SUGGESTIONS:
      return {
        ...state,
        recipe: { ...state.recipe, suggestions: action.payload },
      };

    case ACTIONS.SET_LOADING_SUGGESTIONS:
      return {
        ...state,
        recipe: { ...state.recipe, loadingSuggestions: action.payload },
      };

    case ACTIONS.SELECT_RECIPE:
      return {
        ...state,
        recipe: { ...state.recipe, selectedRecipe: action.payload },
        modal: { ...state.modal, dishName: action.payload?.strMeal || '' },
      };

    case ACTIONS.SET_RECIPE_DETAILS:
      return {
        ...state,
        recipe: { ...state.recipe, recipeDetails: action.payload },
      };

    case ACTIONS.SET_RECIPE_LOADING:
      return {
        ...state,
        recipe: { ...state.recipe, recipeLoading: action.payload },
      };

    case ACTIONS.RESET_RECIPE:
      return {
        ...state,
        recipe: initialRecipeState,
      };

    // UI actions
    case ACTIONS.SHOW_TOAST:
      return {
        ...state,
        ui: {
          ...state.ui,
          toastOpen: true,
          toastMessage: action.payload,
        },
      };

    case ACTIONS.HIDE_TOAST:
      return {
        ...state,
        ui: {
          ...state.ui,
          toastOpen: false,
          toastMessage: '',
        },
      };

    case ACTIONS.SET_EXPIRING_ITEMS:
      return {
        ...state,
        ui: { ...state.ui, expiringItems: action.payload },
      };

    // Meal plans actions
    case ACTIONS.SET_MEAL_PLANS:
      return {
        ...state,
        mealPlans: action.payload,
      };

    case ACTIONS.ADD_MEAL_PLAN:
      return {
        ...state,
        mealPlans: [...state.mealPlans, action.payload],
      };

    case ACTIONS.UPDATE_MEAL_PLAN:
      return {
        ...state,
        mealPlans: state.mealPlans.map((meal) =>
          meal._id === action.payload._id ? action.payload : meal
        ),
      };

    case ACTIONS.DELETE_MEAL_PLAN:
      return {
        ...state,
        mealPlans: state.mealPlans.filter((meal) => meal._id !== action.payload),
      };

    default:
      return state;
  }
}

export function useMealPlannerState() {
  const [state, dispatch] = useReducer(mealPlannerReducer, initialState);
  return [state, dispatch];
}
