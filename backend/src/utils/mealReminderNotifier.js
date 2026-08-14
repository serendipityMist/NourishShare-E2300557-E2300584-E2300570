import { MealPlan } from "../models/mealPlan.model.js";
import { Notification } from "../models/notification.model.js";

const DAY_INDEX = { Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5, Sunday: 6 };
const MEAL_TIMES = {
    Breakfast: [8, 0],
    Lunch: [12, 0],
    Snack: [15, 0],
    Dinner: [18, 0]
};

function getReminderDueAt(mealPlan) {
    const scheduledAt = new Date(mealPlan.weekStartDate);
    scheduledAt.setDate(scheduledAt.getDate() + DAY_INDEX[mealPlan.day]);
    const [hour, minute] = MEAL_TIMES[mealPlan.mealType] || MEAL_TIMES.Dinner;
    scheduledAt.setHours(hour, minute, 0, 0);
    return new Date(scheduledAt.getTime() - mealPlan.reminderTime * 60 * 1000);
}

async function runMealReminderPass() {
    const now = new Date();
    const pendingReminders = await MealPlan.find({ reminderActive: true, reminderSentAt: null });

    for (const mealPlan of pendingReminders) {
        if (getReminderDueAt(mealPlan) > now) continue;

        const claimed = await MealPlan.findOneAndUpdate(
            { _id: mealPlan._id, reminderSentAt: null },
            { $set: { reminderSentAt: now } },
            { new: true }
        );
        if (!claimed) continue;

        await Notification.create({
            owner: claimed.user,
            title: `Time to prepare ${claimed.mealName}`,
            description: `${claimed.mealType} on ${claimed.day} starts in ${claimed.reminderTime} minutes.`,
            notificationType: "Meal"
        });
    }
}

export function scheduleMealReminders(options = {}) {
    const intervalMs = options.intervalMs || 60 * 1000;
    runMealReminderPass().catch((error) => console.error("Meal reminder pass failed:", error));
    setInterval(() => {
        runMealReminderPass().catch((error) => console.error("Meal reminder pass failed:", error));
    }, intervalMs);
}
