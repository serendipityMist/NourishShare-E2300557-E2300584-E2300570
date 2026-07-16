import AppLayout from '../components/layout/AppLayout.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function MealPlanner() {
  return (
    <AppLayout title="Meal Planner">
      <EmptyState
        icon="calendar_month"
        title="Meal Planner is coming soon"
        message="This screen is part of a future use case (UC6) and isn't built out yet in this milestone. The navigation link is wired up and ready for when it is."
      />
    </AppLayout>
  );
}
