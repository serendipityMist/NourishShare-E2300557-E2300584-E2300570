import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Button from '../components/ui/Button.jsx';
import { mealPlanService } from '../services/mealPlanService';
import { useNotifications } from '../hooks/useNotifications';

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function MealPlanner() {
  const { showToast } = useNotifications();
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMealPlans();
  }, []);

  async function fetchMealPlans() {
    try {
      setLoading(true);
      const res = await mealPlanService.getMyMealPlans();
      setMealPlans(res.data?.data?.mealPlans || []);
    } catch (error) {
      if (error.response?.status !== 404) {
        showToast(
          error.response?.data?.message || 'Unable to load meal plans',
          'error'
        );
      }
      setMealPlans([]);
    } finally {
      setLoading(false);
    }
  }

  async function removeEntry(id) {
    try {
      await mealPlanService.deleteMealPlanEntry(id);
      setMealPlans((prev) => prev.filter((entry) => entry._id !== id));
      showToast('Meal plan entry removed');
    } catch (error) {
      showToast(
        error.response?.data?.message || 'Unable to remove meal plan entry',
        'error'
      );
    }
  }

  const groupedPlans = useMemo(() => {
    return DAYS.reduce((acc, day) => {
      acc[day] = mealPlans.filter((entry) => entry.day === day);
      return acc;
    }, {});
  }, [mealPlans]);

  if (loading) {
    return (
      <AppLayout title="Meal Planner">
        <div className="flex justify-center items-center h-96">
          <p className="text-on-surface-variant">Loading meal plan...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Meal Planner">
      <div className="mb-lg flex flex-col md:flex-row md:items-end md:justify-between gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary mb-xs">
            Weekly Meal Planner
          </h2>
          <p className="font-body-md text-on-surface-variant">
            Plan meals using items from your inventory before they expire.
          </p>
        </div>
        <Link to="/inventory">
          <Button variant="outline" icon="inventory_2">
            Browse Inventory
          </Button>
        </Link>
      </div>

      {mealPlans.length === 0 ? (
        <EmptyState
          icon="calendar_month"
          title="No meals planned yet"
          message="Open any inventory item and choose Plan for Meal to start your weekly plan."
          action={
            <Link to="/donations">
              <Button icon="search">Browse Food Items</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg">
          {DAYS.map((day) => (
            <section
              key={day}
              className="bg-white border border-outline-variant rounded-xl p-lg"
            >
              <h3 className="font-headline-md text-primary mb-md">{day}</h3>
              {groupedPlans[day].length === 0 ? (
                <p className="text-sm text-on-surface-variant">No meals planned.</p>
              ) : (
                <div className="space-y-md">
                  {groupedPlans[day].map((entry) => {
                    const food = entry.food?.[0];
                    return (
                      <div
                        key={entry._id}
                        className="border border-outline-variant rounded-lg p-md"
                      >
                        <div className="flex justify-between gap-md">
                          <div>
                            <p className="font-label-md text-on-surface">
                              {entry.mealType}
                            </p>
                            <p className="font-body-md text-primary">
                              {entry.mealName}
                            </p>
                            {food && (
                              <p className="text-label-sm text-on-surface-variant mt-xs">
                                {food.quantity?.number} {food.quantity?.units} • {food.storageLocation}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeEntry(entry._id)}
                            className="material-symbols-outlined text-on-surface-variant hover:text-error"
                          >
                            delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
