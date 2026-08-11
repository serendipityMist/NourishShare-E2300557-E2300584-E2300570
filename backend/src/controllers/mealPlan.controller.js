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

    if (!day || !mealType) {
        throw new ApiError(400, "Day and meal type are required");
    }

    if (!DAYS.includes(day)) {
        throw new ApiError(400, "Invalid day selected");
    }

    let foods = [];
    if (Array.isArray(foodIds) && foodIds.length > 0) {
        foods = await Food.find({
            _id: { $in: foodIds },
            owner: req.user._id
        });

        if (foods.length !== foodIds.length) {
            throw new ApiError(404, "One or more food items were not found");
        }

        const invalidFood = foods.find(
            (item) => item.status === "Used" || item.status === "Donated"
        );
        if (invalidFood) {
            throw new ApiError(400, "One or more selected food items cannot be planned for a meal");
        }
    }

    const entry = await MealPlan.create({
        weekStartDate: weekStartDate ? new Date(weekStartDate) : getWeekStartDate(),
        day,
        mealType,
        reminderActive: Boolean(reminderActive),
        reminderTime: Number(reminderTime) || 60,
        mealImage: mealImage || '',
        mealName: mealName || foods.map((item) => item.name).join(', ') || 'Custom meal',
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

    if (entry.reminderActive) {
        const title = `Meal reminder set for ${entry.mealType} on ${entry.day}`;
        const description = `Your meal "${entry.mealName}" is scheduled for ${entry.day} (${entry.mealType}). You will be reminded ${entry.reminderTime} minutes before.`;

        await Notification.create({
            owner: req.user._id,
            title,
            description,
            notificationType: "Meal"
        });
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            { mealPlan: populatedEntry },
            "Meal plan entry created successfully"
        )
    );
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

    await mealPlan.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, {}, "Meal plan entry removed")
    );
});

export {
    addMealPlanEntry,
    getMyMealPlans,
    deleteMealPlanEntry
};
