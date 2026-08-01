import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { mealPlanService } from '../services/mealPlanService';
import { useNotifications } from '../hooks/useNotifications';

const WEEK = [
  { day: 'Mon', date: '23', meals: { b: 'Nasi Lemak', l: 'Chicken Adobo', d: null }, notes: 'Basmati Rice, Anchovies' },
  { day: 'Tue', date: '24', meals: { b: 'Fruit Smoothie', l: null, d: 'Beef Rendang' }, notes: 'Banana, Spinach' },
  { day: 'Wed', date: '25', meals: { b: 'Soft Boiled Eggs', l: 'Pesto Pasta', d: 'Grilled Sea Bass' }, notes: 'Eggs, Pesto' },
  { day: 'Thu', date: '26', meals: { b: null, l: 'Quinoa Salad', d: 'Stir-fry Veggies' }, notes: 'Quinoa, Greens' },
  { day: 'Fri', date: '27', meals: { b: 'Overnight Oats', l: 'Laksa', d: null }, notes: 'Oats, Coconut Milk' },
  { day: 'Sat', date: '28', meals: { b: 'Pancakes', l: 'BBQ Skewers', d: 'Family Feast' }, notes: 'Flour, Veggies' },
  { day: 'Sun', date: '29', meals: { b: 'Dim Sum', l: 'Roast Chicken', d: 'Leftovers' }, notes: 'Dumplings, Chicken' },
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
    return mealPlans.reduce((acc, entry) => {
      const day = entry.day || 'Monday';
      if (!acc[day]) acc[day] = [];
      acc[day].push(entry);
      return acc;
    }, {});
  }, [mealPlans]);

  const plannedCount = mealPlans.length;
  const completion = mealPlans.length ? Math.min(100, Math.round((plannedCount / 21) * 100)) : 66;

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
      <div className="mb-xl flex flex-col md:flex-row justify-between items-start md:items-end gap-lg">
        <div className="space-y-sm">
          <div className="flex items-center gap-md">
            <button className="p-sm hover:bg-surface-container rounded-full transition-colors">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <h2 className="font-headline-lg text-headline-lg">October 23 – 29, 2023</h2>
            <button className="p-sm hover:bg-surface-container rounded-full transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          <p className="text-on-surface-variant font-body-md italic">
            A nourishing week for the soul and the kitchen.
          </p>
        </div>

        <div className="w-full md:w-80 space-y-xs">
          <div className="flex justify-between font-label-md">
            <span>Weekly Completion</span>
            <span className="text-secondary font-bold">{plannedCount}/21 Meals</span>
          </div>
          <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-secondary-container" style={{ width: `${completion}%` }} />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-outline">
            Goal: Reduce food waste by 15%
          </p>
        </div>

        <Link to="/inventory" className="inline-flex">
          <Button className="bg-primary text-on-primary py-md px-xl rounded-full font-label-md shadow-sm active:scale-[0.98] transition-transform flex items-center gap-sm" icon="auto_fix_high">
            New Meal Plan
          </Button>
        </Link>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-7 gap-gutter">
        {WEEK.map((item) => (
          <div key={item.day} className="flex flex-col gap-md">
            <div className="text-center py-md border-b-2 border-primary/20">
              <span className="font-label-md uppercase tracking-tighter opacity-60">{item.day}</span>
              <div className="font-headline-md text-primary">{item.date}</div>
            </div>
            <div className="space-y-md">
              <MealSlot title="Breakfast" item={item.meals.b} note={item.notes} />
              <MealSlot title="Lunch" item={item.meals.l} note={item.notes} />
              <MealSlot title="Dinner" item={item.meals.d} note={item.notes} isButton />
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-lg pt-xl">
        <div className="lg:col-span-2 bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row">
          <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJJcrdIN9A1N_15c6Eb7K5as5gkUv2S3ouembuoXsbjufbrrUpy8hrHsK1n013zZsZYEGaubp4EFm1kwaq4zeia9SsWw9emKUTW97EE5dL5j-5OCdSBRw6u34nwG8cbHKCfqQfTyyiAzNFhnU5yPs5H7xb9loD5x1Toc67kO77RqxE516vRM9RKTFenlQ8UAMbCJAiwtYLtgtekHltr7iCJEZ1zNcnCO8FatT3nk1_ZEt4vAukJNkSiQPY7RWo7N10spK8qU3eXA"
              alt="Meal prep inspiration"
            />
          </div>
          <div className="p-lg flex-1 flex flex-col justify-center space-y-md">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-secondary">tips_and_updates</span>
              <h3 className="font-headline-md text-primary">Smart Prep Suggestions</h3>
            </div>
            <p className="text-on-surface-variant font-body-md">
              Based on items expiring in 3 days, we suggest adding a <strong>Vegetable Stir-fry</strong> to Wednesday's dinner to use up your Bok Choy and Tofu.
            </p>
            <div className="flex gap-md">
              <button className="text-primary font-label-md border border-primary px-lg py-xs rounded-full hover:bg-primary/5 transition-colors">
                Accept Suggestion
              </button>
              <button className="text-outline font-label-md hover:text-on-surface transition-colors">
                See More
              </button>
            </div>
          </div>
        </div>

        <div className="bg-secondary-fixed text-on-secondary-fixed p-lg rounded-xl flex flex-col justify-between space-y-md relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              restaurant_menu
            </span>
          </div>
          <div className="space-y-xs">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Editor's Choice</span>
            <h3 className="font-headline-md">Fragrant Laksa Lemak</h3>
            <p className="font-label-sm opacity-90">Uses 4 items from your current inventory.</p>
          </div>
          <div className="flex items-center gap-md pt-md">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8YEJ_Fr2fcEzwxW_24k4JQJtCt7c1A3KbWrKaXr7b79Jy1dY9oDpKhuuLmoMYoJafMHkIsaBR6PKQIHxKlrlNzS10H7-OOM-iz_0I_ckSLK9q7pfRAGaYD4zvCDUmtHL5jnWIZBxOYwzG46JDoEdhYhP9Ssj5fnD0ZvvL0ZbnV7Kbn5I6pVUyJkPppu8seQEyenHyrPXXmicjMuqXopeTDCmB6b7uy-qJJoOPlG8i79vNvrPYMeL34rbD435J6qvHQbTtb0II1g"
                alt="Chef portrait"
              />
            </div>
            <span className="font-label-sm font-semibold italic">Recipe by Mak Cik Aminah</span>
          </div>
          <button className="w-full bg-on-secondary-fixed text-secondary-fixed py-md rounded-lg font-label-md mt-auto active:opacity-80 transition-opacity">
            Plan for Sunday
          </button>
        </div>
      </section>
    </AppLayout>
  );
}

function MealSlot({ title, item, note, isButton }) {
  if (isButton && !item) {
    return (
      <button className="w-full border-2 border-dashed border-outline-variant p-md rounded-lg flex flex-col items-center justify-center gap-xs hover:border-primary hover:bg-primary/5 transition-all text-outline-variant hover:text-primary min-h-[100px]">
        <span className="material-symbols-outlined">add_circle</span>
        <span className="text-[10px] font-bold uppercase">Add Dinner</span>
      </button>
    );
  }

  return (
    <div className={`bg-surface-container-lowest border border-outline-variant p-md rounded-lg ${item ? 'pantry-tag hover:border-secondary transition-all cursor-pointer' : 'min-h-[100px]'}`}>
      <div className="flex justify-between items-start mb-xs">
        <span className="text-[10px] font-bold uppercase text-outline">{title}</span>
        {item && <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity">edit</span>}
      </div>
      {item ? (
        <>
          <p className="font-body-md font-semibold text-on-surface">{item}</p>
          <div className="flex items-center gap-xs mt-sm text-primary">
            <span className="material-symbols-outlined text-[16px]">inventory</span>
            <span className="text-[10px] font-label-sm">{note}</span>
          </div>
        </>
      ) : (
        <p className="text-[10px] font-bold uppercase">Add {title}</p>
      )}
    </div>
  );
}
