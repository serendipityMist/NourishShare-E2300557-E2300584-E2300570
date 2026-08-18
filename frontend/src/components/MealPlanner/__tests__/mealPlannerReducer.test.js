import { describe, it, expect } from 'vitest';
import { mealPlannerReducer, initialState, ACTIONS } from '../mealPlannerReducer.js';

describe('mealPlannerReducer', () => {
  it('returns the same state for an unknown action', () => {
    const state = mealPlannerReducer(initialState, { type: 'UNKNOWN' });
    expect(state).toBe(initialState);
  });

  it('OPEN_MODAL populates modal fields from the payload with sensible defaults', () => {
    const state = mealPlannerReducer(initialState, {
      type: ACTIONS.OPEN_MODAL,
      payload: { day: 'Tuesday', slot: 'Dinner' },
    });
    expect(state.modal.modalOpen).toBe(true);
    expect(state.modal.mealDay).toBe('Tuesday');
    expect(state.modal.currentSlot).toBe('Dinner');
    expect(state.modal.currentEditingId).toBeNull();
    expect(state.modal.dishName).toBe('');
  });

  it('OPEN_MODAL falls back to Monday/Breakfast when day/slot are omitted', () => {
    const state = mealPlannerReducer(initialState, { type: ACTIONS.OPEN_MODAL, payload: {} });
    expect(state.modal.mealDay).toBe('Monday');
    expect(state.modal.currentSlot).toBe('Breakfast');
  });

  it('CLOSE_MODAL resets modal and recipe state but keeps mealPlans', () => {
    const dirty = {
      ...initialState,
      modal: { ...initialState.modal, modalOpen: true, dishName: 'Soup' },
      mealPlans: [{ _id: 'm1' }],
    };
    const state = mealPlannerReducer(dirty, { type: ACTIONS.CLOSE_MODAL });
    expect(state.modal.modalOpen).toBe(false);
    expect(state.modal.dishName).toBe('');
    expect(state.mealPlans).toEqual([{ _id: 'm1' }]);
  });

  it('SET_DISH_NAME updates only the dish name', () => {
    const state = mealPlannerReducer(initialState, { type: ACTIONS.SET_DISH_NAME, payload: 'Pasta' });
    expect(state.modal.dishName).toBe('Pasta');
  });

  it('ADD_ITEM appends a new item and closes the inventory menu', () => {
    const state = mealPlannerReducer(initialState, {
      type: ACTIONS.ADD_ITEM,
      payload: { _id: 'i1', name: 'Tomato' },
    });
    expect(state.modal.selectedItems).toEqual([{ _id: 'i1', name: 'Tomato' }]);
    expect(state.modal.inventoryMenuOpen).toBe(false);
  });

  it('ADD_ITEM does not add a duplicate item (matched by _id)', () => {
    const withItem = {
      ...initialState,
      modal: { ...initialState.modal, selectedItems: [{ _id: 'i1', name: 'Tomato' }] },
    };
    const state = mealPlannerReducer(withItem, {
      type: ACTIONS.ADD_ITEM,
      payload: { _id: 'i1', name: 'Tomato' },
    });
    expect(state.modal.selectedItems).toHaveLength(1);
  });

  it('REMOVE_ITEM removes only the matching item', () => {
    const withItems = {
      ...initialState,
      modal: { ...initialState.modal, selectedItems: [{ _id: 'i1' }, { _id: 'i2' }] },
    };
    const state = mealPlannerReducer(withItems, { type: ACTIONS.REMOVE_ITEM, payload: 'i1' });
    expect(state.modal.selectedItems).toEqual([{ _id: 'i2' }]);
  });

  it('SELECT_RECIPE sets the recipe and pre-fills the dish name from strMeal', () => {
    const state = mealPlannerReducer(initialState, {
      type: ACTIONS.SELECT_RECIPE,
      payload: { strMeal: 'Fried Rice' },
    });
    expect(state.recipe.selectedRecipe).toEqual({ strMeal: 'Fried Rice' });
    expect(state.modal.dishName).toBe('Fried Rice');
  });

  it('SELECT_RECIPE with a null payload clears the dish name', () => {
    const state = mealPlannerReducer(initialState, { type: ACTIONS.SELECT_RECIPE, payload: null });
    expect(state.modal.dishName).toBe('');
  });

  it('SHOW_TOAST and HIDE_TOAST toggle toast state', () => {
    const shown = mealPlannerReducer(initialState, { type: ACTIONS.SHOW_TOAST, payload: 'Saved!' });
    expect(shown.ui.toastOpen).toBe(true);
    expect(shown.ui.toastMessage).toBe('Saved!');

    const hidden = mealPlannerReducer(shown, { type: ACTIONS.HIDE_TOAST });
    expect(hidden.ui.toastOpen).toBe(false);
    expect(hidden.ui.toastMessage).toBe('');
  });

  it('SET_ERROR resets the retry counter, and RESET_ERROR_RETRY increments it', () => {
    const withRetries = { ...initialState, ui: { ...initialState.ui, errorRetryCount: 2 } };
    const errored = mealPlannerReducer(withRetries, { type: ACTIONS.SET_ERROR, payload: 'Oops' });
    expect(errored.ui.error).toBe('Oops');
    expect(errored.ui.errorRetryCount).toBe(0);

    const retried = mealPlannerReducer(errored, { type: ACTIONS.RESET_ERROR_RETRY });
    expect(retried.ui.errorRetryCount).toBe(1);
  });

  it('CLEAR_ERROR clears the error without touching the retry count', () => {
    const errored = { ...initialState, ui: { ...initialState.ui, error: 'Oops', errorRetryCount: 3 } };
    const state = mealPlannerReducer(errored, { type: ACTIONS.CLEAR_ERROR });
    expect(state.ui.error).toBeNull();
    expect(state.ui.errorRetryCount).toBe(3);
  });

  it('ADD_MEAL_PLAN appends to the mealPlans list', () => {
    const state = mealPlannerReducer(initialState, { type: ACTIONS.ADD_MEAL_PLAN, payload: { _id: 'm1' } });
    expect(state.mealPlans).toEqual([{ _id: 'm1' }]);
  });

  it('UPDATE_MEAL_PLAN replaces only the matching plan', () => {
    const withPlans = { ...initialState, mealPlans: [{ _id: 'm1', mealName: 'Old' }, { _id: 'm2', mealName: 'Keep' }] };
    const state = mealPlannerReducer(withPlans, {
      type: ACTIONS.UPDATE_MEAL_PLAN,
      payload: { _id: 'm1', mealName: 'New' },
    });
    expect(state.mealPlans).toEqual([{ _id: 'm1', mealName: 'New' }, { _id: 'm2', mealName: 'Keep' }]);
  });

  it('DELETE_MEAL_PLAN removes only the matching plan', () => {
    const withPlans = { ...initialState, mealPlans: [{ _id: 'm1' }, { _id: 'm2' }] };
    const state = mealPlannerReducer(withPlans, { type: ACTIONS.DELETE_MEAL_PLAN, payload: 'm1' });
    expect(state.mealPlans).toEqual([{ _id: 'm2' }]);
  });

  it('SET_MEAL_PLANS replaces the entire list', () => {
    const state = mealPlannerReducer(initialState, {
      type: ACTIONS.SET_MEAL_PLANS,
      payload: [{ _id: 'a' }, { _id: 'b' }],
    });
    expect(state.mealPlans).toHaveLength(2);
  });
});
