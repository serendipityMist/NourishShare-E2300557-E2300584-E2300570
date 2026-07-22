import { MealPlan } from "../models/mealPlan.model.js";
import { Food } from "../models/food.model.js";
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
    const { foodId, day, mealType, mealName, weekStartDate } = req.body;

    if (!foodId || !day || !mealType) {
        throw new ApiError(400, "Food item, day, and meal type are required");
    }

    if (!DAYS.includes(day)) {
        throw new ApiError(400, "Invalid day selected");
    }

    const food = await Food.findOne({
        _id: foodId,
        owner: req.user._id
    });

    if (!food) {
        throw new ApiError(404, "Food item not found");
    }

    if (food.status === "Used" || food.status === "Donated") {
        throw new ApiError(400, "This food item cannot be planned for a meal");
    }

    const entry = await MealPlan.create({
        weekStartDate: weekStartDate ? new Date(weekStartDate) : getWeekStartDate(),
        day,
        mealType,
        mealName: mealName || food.name,
        user: req.user._id,
        food: [food._id]
    });

    const populatedEntry = await MealPlan.findById(entry._id)
        .populate({
            path: "food",
            populate: { path: "category" }
        });

    return res.status(201).json(
        new ApiResponse(
            201,
            { mealPlan: populatedEntry },
            "Food item added to meal plan"
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
