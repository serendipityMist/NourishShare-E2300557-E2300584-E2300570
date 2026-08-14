import { MealPlan } from "../models/mealPlan.model.js";
import { Food } from "../models/food.model.js";
import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiReponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

async function resolveFoods(foodIds, userId) {
    if (!Array.isArray(foodIds) || !foodIds.length) return [];
    const uniqueFoodIds = [...new Set(foodIds.map(String))];
    const foods = await Food.find({ _id: { $in: uniqueFoodIds }, owner: userId });
    if (foods.length !== uniqueFoodIds.length) {
        throw new ApiError(404, "One or more food items were not found");
    }
    if (foods.some((item) => item.status === "Used" || item.status === "Donated")) {
        throw new ApiError(400, "One or more selected food items cannot be planned for a meal");
    }
    return foods;
}

function getWeekStartDate(date = new Date()) {
    const current = new Date(date);
    const day = current.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    current.setDate(current.getDate() + diff);
    current.setHours(0, 0, 0, 0);
    return current;
}

const addMealPlanEntry = asyncHandler(async (req, res) => {
    const { foodIds, day, mealType, mealName, weekStartDate, reminderActive, reminderTime, mealImage } = req.body;

    if (!day || !mealType || !mealName?.trim()) {
        throw new ApiError(400, "Day, meal type, and meal name are required");
    }

    if (!DAYS.includes(day)) {
        throw new ApiError(400, "Invalid day selected");
    }
    if (!MEAL_TYPES.includes(mealType)) {
        throw new ApiError(400, "Invalid meal type selected");
    }

    const foods = await resolveFoods(foodIds, req.user._id);

    const entry = await MealPlan.create({
        weekStartDate: weekStartDate ? new Date(weekStartDate) : getWeekStartDate(),
        day,
        mealType,
        reminderActive: Boolean(reminderActive),
        reminderTime: Number(reminderTime) || 60,
        mealImage: mealImage || '',
        mealName: mealName.trim(),
        user: req.user._id,
        food: foods.map((item) => item._id)
    });

    await Promise.all(
        foods.map(async (food) => {
            if (food.status === "Available") {
                food.status = "Reserved";
                await food.save();
            }
        })
    );

    const populatedEntry = await MealPlan.findById(entry._id)
        .populate({
            path: "food",
            populate: { path: "category" }
        });

    return res.status(201).json(
        new ApiResponse(
            201,
            { mealPlan: populatedEntry },
            "Meal plan entry created successfully"
        )
    );
});

const updateMealPlanEntry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { foodIds, day, mealType, mealName, reminderActive, reminderTime, mealImage } = req.body;
    if (!DAYS.includes(day) || !MEAL_TYPES.includes(mealType) || !mealName?.trim()) {
        throw new ApiError(400, "Valid day, meal type, and meal name are required");
    }

    const entry = await MealPlan.findOne({ _id: id, user: req.user._id });
    if (!entry) throw new ApiError(404, "Meal plan entry not found");

    const foods = await resolveFoods(foodIds, req.user._id);
    const nextFoodIds = foods.map((food) => food._id);
    const previousFoodIds = entry.food.map(String);

    await Food.updateMany({ _id: { $in: previousFoodIds.filter((foodId) => !nextFoodIds.some((nextId) => String(nextId) === foodId)) }, status: "Reserved" }, { $set: { status: "Available" } });
    await Food.updateMany({ _id: { $in: nextFoodIds } }, { $set: { status: "Reserved" } });

    entry.set({ day, mealType, mealName: mealName.trim(), mealImage: mealImage || '', reminderActive: Boolean(reminderActive), reminderTime: Number(reminderTime) || 60, reminderSentAt: null, food: nextFoodIds });
    await entry.save();
    await entry.populate({ path: "food", populate: { path: "category" } });

    return res.status(200).json(new ApiResponse(200, { mealPlan: entry }, "Meal plan entry updated successfully"));
});

const getMyMealPlans = asyncHandler(async (req, res) => {
    const weekStart = req.query.weekStartDate
        ? new Date(req.query.weekStartDate)
        : getWeekStartDate();

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const mealPlans = await MealPlan.find({
        user: req.user._id,
        weekStartDate: {
            $gte: weekStart,
            $lt: weekEnd
        }
    }).populate({
        path: "food",
        populate: { path: "category" }
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            { mealPlans },
            mealPlans.length
                ? "Meal plans fetched successfully"
                : "No meal plans found for this week"
        )
    );
});

const deleteMealPlanEntry = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const mealPlan = await MealPlan.findOne({
        _id: id,
        user: req.user._id
    });

    if (!mealPlan) {
        throw new ApiError(404, "Meal plan entry not found");
    }

    await Food.updateMany({ _id: { $in: mealPlan.food }, status: "Reserved" }, { $set: { status: "Available" } });
    await mealPlan.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, {}, "Meal plan entry removed")
    );
});

export {
    addMealPlanEntry,
    updateMealPlanEntry,
    getMyMealPlans,
    deleteMealPlanEntry
};
