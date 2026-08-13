import React, { useEffect, useRef } from 'react';
import RecipeSuggestions from './RecipeSuggestions.jsx';
import { DAYS, MEAL_SLOTS, REMINDER_OPTIONS } from './constants.js';
import { getExpiryStatus } from '../../utils/dateUtils.js';

const MealPlannerModal = ({
  isOpen,
  isEditing,
  mealDay,
  currentSlot,
  dishName,
  selectedItems,
  inventoryMenuOpen,
  reminderActive,
  reminderTime,
  suggestions,
  selectedRecipe,
  recipeDetails,
  loadingSuggestions,
  recipeLoading,
  activeItems,
  onMealDayChange,
  onMealSlotChange,
  onDishNameChange,
  onFetchRecipeSuggestions,
  onRecipeSelect,
  onAddInventoryItem,
  onRemoveInventoryItem,
  onToggleInventoryMenu,
  onToggleReminder,
  onReminderTimeChange,
  onSave,
  onDelete,
  onClose,
}) => {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    previousFocusRef.current = document.activeElement;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center modal-backdrop transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="meal-planner-modal-title" className={`bg-white rounded-xl shadow-2xl max-w-4xl w-full flex overflow-hidden border border-outline-variant transform transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}>
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
              <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-3 py-0.5 rounded-full text-xs font-bold self-start">{isEditing ? 'EDIT MEAL' : 'PLAN MEAL'}</span>
              <h2 id="meal-planner-modal-title" className="text-2xl font-bold text-on-surface">{isEditing ? 'Edit Meal' : 'Plan a Meal'}</h2>
            </div>
            <button ref={closeButtonRef} type="button" aria-label="Close meal planner" className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors p-2" onClick={onClose}>
              close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="meal-day" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Scheduled Day</label>
              <select
                id="meal-day"
                value={mealDay}
                onChange={(e) => onMealDayChange(e.target.value)}
                className="rounded-lg border-outline-variant bg-surface-container-low text-sm focus:ring-primary focus:border-primary w-full px-4 py-2.5"
              >
                {DAYS.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <span id="meal-slot-label" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Meal Slot</span>
              <div role="radiogroup" aria-labelledby="meal-slot-label" className="flex rounded-lg overflow-hidden border border-outline-variant h-10">
                {MEAL_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    role="radio"
                    aria-checked={currentSlot === slot}
                    onClick={() => onMealSlotChange(slot)}
                    className={`flex-1 text-xs font-bold transition-colors ${currentSlot === slot ? 'bg-surface text-primary' : 'bg-transparent text-on-surface-variant'}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="dish-name" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Dish Name</label>
            <input
              id="dish-name"
              value={dishName}
              onChange={(e) => onDishNameChange(e.target.value)}
              className="rounded-lg border-outline-variant bg-surface-container-low text-sm focus:ring-primary focus:border-primary w-full px-4 py-2.5"
              placeholder="Enter dish name..."
              type="text"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span id="inventory-items-label" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Required Inventory Items</span>
            <div className="p-4 bg-surface-container rounded-lg border border-outline-variant/50">
              <div className="flex flex-wrap gap-2" id="inventoryTags" aria-labelledby="inventory-items-label">
                {selectedItems.map((item) => (
                  <span key={item._id} className="flex items-center gap-1.5 bg-primary-fixed text-on-primary-fixed-variant px-3 py-1.5 rounded-sm text-xs font-bold">
                    {item.name}
                    <button type="button" aria-label={`Remove ${item.name}`} className="material-symbols-outlined text-[14px]" onClick={() => onRemoveInventoryItem(item._id)}>
                      close
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  aria-expanded={inventoryMenuOpen}
                  aria-controls="inventory-menu"
                  className="border border-dashed border-outline-variant text-on-surface-variant px-3 py-1.5 rounded text-xs font-bold hover:bg-white transition-colors"
                  onClick={() => onToggleInventoryMenu(!inventoryMenuOpen)}
                >
                  + Add Item
                </button>
              </div>

              {inventoryMenuOpen && (
                <div id="inventory-menu" role="listbox" aria-label="Available inventory items" className="mt-3 p-2 bg-white rounded border border-outline-variant shadow-lg max-h-44 overflow-y-auto custom-scrollbar">
                  {activeItems.length ? (
                    activeItems.map((item) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedItems.some((selectedItem) => selectedItem._id === item._id)}
                        key={item._id}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-surface-container cursor-pointer"
                        onClick={() => onAddInventoryItem(item)}
                      >
                        {item.name}
                        <span className="text-[11px] text-on-surface-variant ml-2">({getExpiryStatus(item.expiryDate)})</span>
                      </button>
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
                  onClick={onFetchRecipeSuggestions}
                  disabled={!selectedItems.length}
                  aria-busy={loadingSuggestions}
                >
                  {loadingSuggestions ? 'Finding recipes…' : 'Suggest recipes from selected ingredients'}
                </button>
                <p className="text-[10px] text-on-surface-variant/60 italic">
                  Select expiring ingredients and get free recipe suggestions.
                </p>
              </div>
            </div>
          </div>

          <RecipeSuggestions
            suggestions={suggestions}
            selectedRecipe={selectedRecipe}
            recipeDetails={recipeDetails}
            loadingSuggestions={loadingSuggestions}
            recipeLoading={recipeLoading}
            onRecipeSelect={onRecipeSelect}
          />

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
                aria-label="Reminder time"
                value={reminderTime}
                onChange={(e) => onReminderTimeChange(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-xs pr-8"
              >
                {REMINDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                role="switch"
                aria-checked={reminderActive}
                aria-label="Meal prep reminder"
                className={`w-10 h-6 rounded-full relative flex items-center px-1 transition-colors ${reminderActive ? 'bg-primary' : 'bg-outline-variant'}`}
                onClick={onToggleReminder}
              >
                <span className={`w-4 h-4 bg-white rounded-full transition-transform ${reminderActive ? 'translate-x-4' : ''}`} />
              </button>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between pt-6 border-t border-outline-variant">
            <button
              type="button"
              className={`text-error text-xs font-bold flex items-center gap-1 hover:bg-error-container/20 px-3 py-2 rounded-lg transition-colors ${isEditing ? 'visible' : 'invisible'}`}
              onClick={onDelete}
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              Delete Meal
            </button>
            <div className="flex items-center gap-4">
              <button type="button" className="px-6 py-2.5 rounded-lg border border-outline text-on-surface-variant text-xs font-bold hover:bg-surface-variant transition-all" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="px-8 py-2.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all shadow-md" onClick={onSave}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MealPlannerModal);
