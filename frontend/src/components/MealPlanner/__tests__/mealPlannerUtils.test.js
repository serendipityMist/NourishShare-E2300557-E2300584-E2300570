import { describe, it, expect } from 'vitest';
import {
  initializeModalState,
  getDefaultModalState,
  validateDishName,
  buildMealPayload,
  isItemSelected,
  addItemToSelection,
  removeItemFromSelection,
  filterRecipeSuggestions,
  extractIngredientsFromRecipe,
  calculateCompletionPercentage,
  getErrorMessage,
} from '../mealPlannerUtils.js';

describe('initializeModalState', () => {
  it('returns creation defaults when no existing meal is given', () => {
    const state = initializeModalState(null, 'Tuesday', 'Lunch');
    expect(state).toMatchObject({
      currentEditingId: null,
      mealDay: 'Tuesday',
      currentSlot: 'Lunch',
      dishName: '',
      selectedItems: [],
      reminderActive: false,
      reminderTime: '60',
    });
  });

  it('pre-fills state from an existing meal for editing', () => {
    const meal = { _id: 'm1', mealName: 'Soup', food: [{ _id: 'f1' }], reminderActive: true, reminderTime: 30 };
    const state = initializeModalState(meal, 'Friday', 'Dinner');
    expect(state.currentEditingId).toBe('m1');
    expect(state.dishName).toBe('Soup');
    expect(state.selectedItems).toEqual([{ _id: 'f1' }]);
    expect(state.reminderActive).toBe(true);
    expect(state.reminderTime).toBe('30');
  });
});

describe('getDefaultModalState', () => {
  it('returns a closed modal with empty selections', () => {
    const state = getDefaultModalState();
    expect(state.modalOpen).toBe(false);
    expect(state.selectedItems).toEqual([]);
    expect(state.suggestions).toEqual([]);
  });
});

describe('validateDishName', () => {
  it('rejects an empty or whitespace-only name', () => {
    expect(validateDishName('').isValid).toBe(false);
    expect(validateDishName('   ').isValid).toBe(false);
  });

  it('rejects a name shorter than 2 characters', () => {
    const result = validateDishName('A');
    expect(result.isValid).toBe(false);
    expect(result.message).toMatch(/at least 2/);
  });

  it('rejects a name longer than 100 characters', () => {
    const result = validateDishName('A'.repeat(101));
    expect(result.isValid).toBe(false);
    expect(result.message).toMatch(/less than 100/);
  });

  it('accepts a valid dish name', () => {
    expect(validateDishName('Fried Rice')).toEqual({ isValid: true, message: '' });
  });
});

describe('buildMealPayload', () => {
  it('builds a payload with trimmed name and numeric reminder time', () => {
    const payload = buildMealPayload(
      '  Fried Rice  ',
      [{ _id: 'i1' }, { _id: 'i2' }],
      'Monday',
      'Lunch',
      true,
      '30'
    );
    expect(payload).toEqual({
      foodIds: ['i1', 'i2'],
      day: 'Monday',
      mealType: 'Lunch',
      mealName: 'Fried Rice',
      mealImage: '',
      reminderActive: true,
      reminderTime: 30,
    });
  });

  it('prefers the selected recipe image, then recipe details, then first suggestion', () => {
    const withSelected = buildMealPayload('X', [], 'Monday', 'Lunch', false, '60', { strMealThumb: 'a.png' });
    expect(withSelected.mealImage).toBe('a.png');

    const withDetails = buildMealPayload('X', [], 'Monday', 'Lunch', false, '60', null, { strMealThumb: 'b.png' });
    expect(withDetails.mealImage).toBe('b.png');

    const withSuggestion = buildMealPayload('X', [], 'Monday', 'Lunch', false, '60', null, null, [
      { strMealThumb: 'c.png' },
    ]);
    expect(withSuggestion.mealImage).toBe('c.png');
  });
});

describe('isItemSelected / addItemToSelection / removeItemFromSelection', () => {
  const selectedItems = [{ _id: 'i1' }, { _id: 'i2' }];

  it('isItemSelected detects membership by _id', () => {
    expect(isItemSelected({ _id: 'i1' }, selectedItems)).toBe(true);
    expect(isItemSelected({ _id: 'i3' }, selectedItems)).toBe(false);
  });

  it('addItemToSelection appends a new item', () => {
    const result = addItemToSelection({ _id: 'i3' }, selectedItems);
    expect(result).toHaveLength(3);
  });

  it('addItemToSelection is a no-op for a duplicate item', () => {
    const result = addItemToSelection({ _id: 'i1' }, selectedItems);
    expect(result).toBe(selectedItems);
  });

  it('removeItemFromSelection filters out the matching item', () => {
    const result = removeItemFromSelection('i1', selectedItems);
    expect(result).toEqual([{ _id: 'i2' }]);
  });
});

describe('filterRecipeSuggestions', () => {
  it('limits to the default of 8 items', () => {
    const recipes = Array.from({ length: 20 }, (_, i) => ({ id: i }));
    expect(filterRecipeSuggestions(recipes)).toHaveLength(8);
  });

  it('respects a custom limit', () => {
    const recipes = Array.from({ length: 5 }, (_, i) => ({ id: i }));
    expect(filterRecipeSuggestions(recipes, 3)).toHaveLength(3);
  });
});

describe('extractIngredientsFromRecipe', () => {
  it('extracts only ingredients with a non-empty name', () => {
    const recipeDetails = {
      strIngredient1: 'Rice',
      strMeasure1: '2 cups',
      strIngredient2: '',
      strMeasure2: '',
      strIngredient3: '   ',
    };
    const result = extractIngredientsFromRecipe(recipeDetails);
    expect(result).toEqual([{ ingredient: 'Rice', measure: '2 cups' }]);
  });

  it('respects a custom maxIngredients limit', () => {
    const recipeDetails = { strIngredient1: 'Rice', strMeasure1: '2 cups', strIngredient2: 'Egg', strMeasure2: '1' };
    const result = extractIngredientsFromRecipe(recipeDetails, 1);
    expect(result).toHaveLength(1);
  });
});

describe('calculateCompletionPercentage', () => {
  it('returns 0 when mealCount is falsy', () => {
    expect(calculateCompletionPercentage(0, 28)).toBe(0);
  });

  it('computes a rounded percentage', () => {
    expect(calculateCompletionPercentage(7, 28)).toBe(25);
  });

  it('caps the percentage at 100', () => {
    expect(calculateCompletionPercentage(50, 28)).toBe(100);
  });
});

describe('getErrorMessage', () => {
  it('prefers the API response message', () => {
    const error = { response: { data: { message: 'Server said no' } } };
    expect(getErrorMessage(error, 'default')).toBe('Server said no');
  });

  it('falls back to the default message when there is no response message', () => {
    expect(getErrorMessage({}, 'default')).toBe('default');
    expect(getErrorMessage(null, 'default')).toBe('default');
  });
});
