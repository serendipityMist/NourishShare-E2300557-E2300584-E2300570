// Days of the week for meal planning
export const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

// Meal slots throughout the day
export const MEAL_SLOTS = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack'
];

// Number of days in a week
export const DAYS_IN_WEEK = DAYS.length;

// Number of meal slots per day
export const SLOTS_PER_DAY = MEAL_SLOTS.length;

// Total possible meal slots in a week
export const TOTAL_WEEKLY_SLOTS = DAYS_IN_WEEK * SLOTS_PER_DAY;

// Calendar display settings
export const CALENDAR_DAY_WIDTH = 'w-64';
export const CALENDAR_COLUMN_GAP = 'gap-4';
export const CALENDAR_CARD_HEIGHT = 'h-28';

// Modal settings
export const MODAL_MAX_WIDTH = 'max-w-4xl';
export const MODAL_IMAGE_WIDTH = 'w-1/3';

// Reminder time options (in minutes)
export const REMINDER_OPTIONS = [
  { value: '30', label: '30 mins before' },
  { value: '60', label: '1 hour before' },
  { value: '120', label: '2 hours before' }
];

// Default reminder time
export const DEFAULT_REMINDER_TIME = '60';

// Suggestion display limit
export const MAX_SUGGESTIONS = 8;
export const SUGGESTIONS_DISPLAY_LIMIT = 4;

// Recipe ingredients display limit
export const MAX_RECIPE_INGREDIENTS = 20;
