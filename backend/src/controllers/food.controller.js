import { Food } from "../models/food.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiReponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFileInCloudinary } from "../utils/cloudinary.js";


// ======================================================
// ADD FOOD ITEM
// ======================================================
const addFoodItem = asyncHandler(async (req, res) => {

    console.log("\n========== ADD FOOD REQUEST ==========");

    console.log("REQ BODY:");
    console.log(req.body);

    console.log("REQ FILES:");
    console.log(req.files);

    console.log("LOGGED IN USER ID:");
    console.log(req.user?._id);

    console.log("======================================\n");


    // ==================================================
    // GET DATA FROM REQUEST
    // ==================================================

    const {
        name,
        number,
        units,
        expiryDate,
        status,
        description,
        storageLocation,
        category
    } = req.body;


    // ==================================================
    // LOG EACH FIELD
    // ==================================================

    console.log("Food Name:", name);
    console.log("Quantity Number:", number);
    console.log("Units:", units);
    console.log("Expiry Date:", expiryDate);
    console.log("Status:", status);
    console.log("Description:", description);
    console.log("Storage Location:", storageLocation);
    console.log("Category:", category);


    // ==================================================
    // CHECK REQUIRED FIELDS
    // Description is OPTIONAL
    // ==================================================

    const missingFields = [];


    if (!name || name.trim() === "") {
        missingFields.push("name");
    }


    if (
        number === undefined ||
        number === null ||
        number === ""
    ) {
        missingFields.push("number");
    }


    if (!units || units.trim() === "") {
        missingFields.push("units");
    }


    if (!expiryDate || expiryDate.trim() === "") {
        missingFields.push("expiryDate");
    }


    if (!status || status.trim() === "") {
        missingFields.push("status");
    }


    if (
        !storageLocation ||
        storageLocation.trim() === ""
    ) {
        missingFields.push("storageLocation");
    }


    if (!category || category.trim() === "") {
        missingFields.push("category");
    }


    // ==================================================
    // IF ANY REQUIRED FIELD IS MISSING
    // ==================================================

    if (missingFields.length > 0) {

        console.log(
            "MISSING REQUIRED FIELDS:",
            missingFields
        );

        throw new ApiError(
            400,
            `Missing required fields: ${missingFields.join(", ")}`
        );
    }


    // ==================================================
    // VALIDATE QUANTITY
    // ==================================================

    const parsedNumber = Number(number);


    if (
        Number.isNaN(parsedNumber) ||
        parsedNumber <= 0
    ) {

        throw new ApiError(
            400,
            "Please enter a valid quantity of food"
        );

    }


    // ==================================================
    // GET FOOD IMAGE
    // ==================================================

    const foodImageLocalPath =
        req.files?.foodImage?.[0]?.path;


    console.log(
        "Food Image Local Path:",
        foodImageLocalPath
    );


    // ==================================================
    // CHECK FOOD IMAGE
    // ==================================================

    if (!foodImageLocalPath) {

        throw new ApiError(
            400,
            "Food Image is required"
        );

    }


    // ==================================================
    // UPLOAD FOOD IMAGE TO CLOUDINARY
    // ==================================================

    const foodImage =
        await uploadFileInCloudinary(
            foodImageLocalPath
        );


    if (!foodImage) {

        throw new ApiError(
            500,
            "Failed to upload food image"
        );

    }


    const imageUrl =
        foodImage.secure_url ||
        foodImage.url;


    console.log(
        "Food Image URL:",
        imageUrl
    );


    // ==================================================
    // CREATE FOOD ITEM
    // ==================================================

    const food = await Food.create({

        name: name.trim(),

        quantity: {
            number: parsedNumber,
            units: units.trim()
        },

        expiryDate,

        status,

        // Description is optional
        description:
            description?.trim() || "",

        storageLocation:

            storageLocation.trim(),

        foodImage: imageUrl,

        category,

        owner: req.user._id

    });


    console.log(
        "Food item created:",
        food._id
    );


    // ==================================================
    // POPULATE CATEGORY AND OWNER BEFORE RESPONDING
    // ==================================================

    const populatedFood = await Food.findById(food._id)
        .populate("category")
        .populate("owner");


    // ==================================================
    // SEND RESPONSE
    // ==================================================

    return res.status(201).json(

        new ApiResponse(
            201,
            {
                food: populatedFood
            },
            "Food item created successfully"
        )

    );

});


// ======================================================
// EDIT FOOD ITEM
// ======================================================
const editFoodItem = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const {
        name,
        number,
        units,
        expiryDate,
        status,
        description,
        storageLocation,
        category
    } = req.body;

    const missingFields = [];


    if (!name || name.trim() === "") {
        missingFields.push("name");
    }


    if (
        number === undefined ||
        number === null ||
        number === ""
    ) {
        missingFields.push("number");
    }


    if (!units || units.trim() === "") {
        missingFields.push("units");
    }


    if (!expiryDate || expiryDate.trim() === "") {
        missingFields.push("expiryDate");
    }


    if (!status || status.trim() === "") {
        missingFields.push("status");
    }


    if (
        !storageLocation ||
        storageLocation.trim() === ""
    ) {
        missingFields.push("storageLocation");
    }


    if (!category || category.trim() === "") {
        missingFields.push("category");
    }

    if (missingFields.length > 0) {

        console.log(
            "MISSING REQUIRED FIELDS:",
            missingFields
        );

        throw new ApiError(
            400,
            `Missing required fields: ${missingFields.join(", ")}`
        );

    }

    const parsedNumber = Number(number);

    if (
        Number.isNaN(parsedNumber) ||
        parsedNumber <= 0
    ) {

        throw new ApiError(
            400,
            "Please enter a valid quantity of food"
        );

    }


    const food = await Food.findOne(
        {
            $and:[{_id:id},{owner:req.user?._id}]
        }
    );


    if (!food) {

        throw new ApiError(
            404,
            "Food item not found"
        );

    }

    const foodImageLocalPath =
        req.files?.foodImage?.[0]?.path;


    console.log(
        "New Food Image Path:",
        foodImageLocalPath
    );

    if (foodImageLocalPath) {

        const foodImage =
            await uploadFileInCloudinary(
                foodImageLocalPath
            );


        if (!foodImage) {

            throw new ApiError(
                500,
                "Image couldn't be updated"
            );

        }
        food.foodImage = foodImage.url;
    }



    food.name =
        name.trim();


    food.quantity = {

        number: parsedNumber,

        units: units.trim()

    };


    food.expiryDate =
        expiryDate;


    food.status =
        status;


    food.description =
        description?.trim() || "";


    food.storageLocation =
        storageLocation.trim();


    food.category =
        category;

    await food.save();

   //populate food and category before sending data     
    const populatedFood = await Food.findById(food._id)
        .populate("category")
        .populate("owner");


    return res.status(200).json(

        new ApiResponse(

            200,

            {
                food: populatedFood
            },

            "Food item edited successfully"

        )

    );

});


// ======================================================
// DELETE FOOD ITEM
// ======================================================
const deleteFoodItem = asyncHandler(async (req, res) => {

    const { id } = req.params;


    // Find food belonging to current user
    const food = await Food.findOne({

        _id: id,

        owner: req.user._id

    });


    if (!food) {

        throw new ApiError(
            404,
            "Food not found"
        );

    }


    // Delete food
    const result =
        await Food.findByIdAndDelete(id);


    if (!result) {

        throw new ApiError(
            500,
            "Cannot delete food item"
        );

    }


    return res.status(200).json(

        new ApiResponse(

            200,

            {},

            "Item deleted successfully"

        )

    );

});


// ======================================================
// GET FOOD DETAILS
// ======================================================
const getFoodDetails = asyncHandler(async (req, res) => {

    const { id } = req.params;


    const food = await Food.findOne({

        _id: id,

        owner: req.user._id

    }).populate("category");


    if (!food) {

        throw new ApiError(
            404,
            "Food details not found"
        );

    }


    return res.status(200).json(

        new ApiResponse(

            200,

            {
                food
            },

            "Food data fetched successfully"

        )

    );

});


// ======================================================
// GET MY FOOD ITEMS
// ======================================================
const getMyFoodItems = asyncHandler(async (req, res) => {

    const foods = await Food.find({

        owner: req.user._id

    }).populate("category");


    return res.status(200).json(

        new ApiResponse(

            200,

            {
                foods: foods || []
            },

            foods?.length

                ? "Food inventory fetched successfully"

                : "No food items found in your inventory"

        )

    );

});


// ======================================================
// MARK FOOD AS USED
// ======================================================
const markFoodAsUsed = asyncHandler(async (req, res) => {

    const { id } = req.params;


    const food = await Food.findOne({

        _id: id,

        owner: req.user._id

    });


    if (!food) {

        throw new ApiError(

            404,

            "Food not found or you are not authorized to update this food"

        );

    }


    if (food.status === "Used") {

        throw new ApiError(

            400,

            "Food item is already marked as used"

        );

    }


    if (food.status === "Donated") {

        throw new ApiError(

            400,

            "Donated food cannot be marked as used"

        );

    }


    food.status =
        "Used";


    await food.save();


    // ==================================================
    // POPULATE CATEGORY AND OWNER BEFORE RESPONDING
    // ==================================================

    const populatedFood = await Food.findById(food._id)
        .populate("category")
        .populate("owner");


    return res.status(200).json(

        new ApiResponse(

            200,

            {
                food: populatedFood
            },

            "Food item marked as used successfully"

        )

    );

});


// ======================================================
// BROWSE FOOD ITEMS
// ======================================================
const browseFoodItems = asyncHandler(async (req, res) => {

    const {

        category,

        storageLocation,

        status,

        expiryBefore

    } = req.query;


    // Base filter
    const filter = {

        owner: req.user._id

    };


    // Category filter
    if (category) {

        filter.category =
            category;

    }


    // Storage location filter
    if (storageLocation) {

        filter.storageLocation =
            storageLocation;

    }


    // Status filter
    if (status) {

        filter.status =
            status;

    }


    // Expiry date filter
    if (expiryBefore) {

        filter.expiryDate = {

            $lte:
                new Date(expiryBefore)

        };

    }


    // Get foods
    const foods = await Food.find(
        filter
    ).populate("category");


    return res.status(200).json(

        new ApiResponse(

            200,

            {
                foods
            },

            "Food items fetched successfully"

        )

    );

});


const getFoodSaved = asyncHandler(async(req,res)=>{
    //for creating the visualization
})

// ======================================================
// EXPORT CONTROLLERS
// ======================================================

export {

    addFoodItem,

    editFoodItem,

    deleteFoodItem,

    getFoodDetails,

    getMyFoodItems,

    markFoodAsUsed,

    browseFoodItems

};