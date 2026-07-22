import { Category } from "../models/category.model.js";
import { ApiResponse } from "../utils/ApiReponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { DEFAULT_CATEGORY_NAMES } from "../utils/defaultCategories.js";

async function ensureDefaultCategories() {
    const existingCount = await Category.countDocuments();
    if (existingCount > 0) {
        return Category.find().sort({ name: 1 });
    }

    await Category.insertMany(
        DEFAULT_CATEGORY_NAMES.map((name) => ({ name }))
    );

    return Category.find().sort({ name: 1 });
}

const getCategories = asyncHandler(async (req, res) => {
    const categories = await ensureDefaultCategories();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { categories },
                "Categories fetched successfully"
            )
        );
});

export {
    getCategories
};