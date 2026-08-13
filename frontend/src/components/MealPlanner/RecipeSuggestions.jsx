import React from 'react';
import { SUGGESTIONS_DISPLAY_LIMIT } from './constants.js';
import { extractIngredientsFromRecipe } from './mealPlannerUtils.js';

const RecipeSuggestions = ({
  suggestions,
  selectedRecipe,
  recipeDetails,
  loadingSuggestions,
  recipeLoading,
  onRecipeSelect,
}) => {
  return (
    <>
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
            {suggestions.slice(0, SUGGESTIONS_DISPLAY_LIMIT).map((recipe) => (
              <button
                key={recipe.idMeal}
                type="button"
                className="w-full rounded-2xl border border-outline-variant p-3 text-left hover:bg-surface-container-high transition"
                onClick={() => onRecipeSelect(recipe)}
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
                    {extractIngredientsFromRecipe(recipeDetails).map((item, idx) => (
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
    </>
  );
};

export default React.memo(RecipeSuggestions);
