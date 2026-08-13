import React from 'react';
const MealColumn = ({ day, slot, meal, onOpen, onCopyToNextWeek }) => {
  const hasMeal = Boolean(meal);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-tighter">{slot}</span>
        <div className="flex items-center gap-1">
          {hasMeal && (
            <button type="button" onClick={onCopyToNextWeek} aria-label={`Copy ${meal.mealName} to next week`} className="material-symbols-outlined text-xs text-primary hover:bg-primary-container p-1 rounded-full transition-all">
              content_copy
            </button>
          )}
          <button type="button" onClick={onOpen} aria-label={`${hasMeal ? 'Edit' : 'Add'} ${slot} meal for ${day}`} className="material-symbols-outlined text-xs text-primary hover:bg-primary-container p-1 rounded-full active:scale-90 transition-all">
            add
          </button>
        </div>
      </div>
      {hasMeal ? (
        <button type="button" onClick={onOpen} aria-label={`Edit ${meal.mealName}, ${slot} on ${day}`} className="meal-card-hover group bg-white border border-outline-variant rounded-xl p-0 cursor-pointer transition-all text-left overflow-hidden">
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
        <button type="button" onClick={onOpen} aria-label={`Plan a ${slot} meal for ${day}`} className="border-2 border-dashed border-outline-variant/30 rounded-xl h-24 flex items-center justify-center group hover:border-primary/50 transition-colors cursor-pointer">
          <span className="text-xs font-bold uppercase text-on-surface-variant/40 group-hover:text-primary/60">Plan a Meal</span>
        </button>
      )}
    </div>
  );
};

export default React.memo(MealColumn);
