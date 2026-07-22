import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiReponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getCategories = asyncHandler(async (req, res) => {

    const categories = await Category.find();

    console.log("Database:", Category.db.name);
    console.log("Collection:", Category.collection.name);
    console.log("Categories:", categories);

    if (categories.length === 0) {
        throw new ApiError(404, "No categories found");
    }

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