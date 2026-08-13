export type MealSlot = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
export type WeekDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface InventoryItem { _id: string; name: string; expiryDate: string; foodImage?: string; }
export interface Recipe { idMeal: string; strMeal: string; strMealThumb?: string; [key: string]: string | undefined; }
export interface MealPlan { _id: string; day: WeekDay; mealType: MealSlot; mealName: string; food?: InventoryItem[]; mealImage?: string; reminderActive?: boolean; reminderTime?: number | string; }
export interface MealPayload { foodIds: string[]; day: WeekDay; mealType: MealSlot; mealName: string; mealImage: string; reminderActive: boolean; reminderTime: number; }
export interface ValidationResult { isValid: boolean; message: string; }
