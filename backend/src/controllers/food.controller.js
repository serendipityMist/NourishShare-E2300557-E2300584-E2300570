import { Food } from "../models/food.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiReponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFileInCloudinary } from "../utils/cloudinary.js";

const addFoodItem = asyncHandler(async (req, res) => {
    const { name, number, units, expiryDate, status, description, storageLocation, category } = req.body;
    console.log(req.user);
    console.log(req.user._id);
    if (!name || !units || !status || !description || !storageLocation || !category) {
        throw new ApiError(400, "Please enter the required fields");
    }
    if (number == null) {
        throw new ApiError(400, "Please enter the quantity of food");
    }

    const foodImageLocalPath = req.files?.foodImage[0]?.path;
    console.log(foodImageLocalPath);

    if (!foodImageLocalPath) {
        throw new ApiError(400, "Food Image is required");
    }

    const foodImage = await uploadFileInCloudinary(foodImageLocalPath);
    console.log("Food Image Url:", foodImage.url);

    //creating food object
    const food = await Food.create({
        name,
        quantity: {
            number,
            units
        },
        expiryDate,
        status,
        description,
        storageLocation,
        foodImage: foodImage.url,
        category,
        owner: req.user._id
    })

    return res.status(200).json(new ApiResponse(200, { food }, "Food Object Created"));
})


const editFoodItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    //getting new values from the user 
    const { name, number, units, expiryDate, status, description, storageLocation, category } = req.body;

    console.log("Food ID from URL:", id);
    console.log("Logged-in User ID:", req.user._id);
    if (!name || !units || !status || !description || !storageLocation || !category) {
        throw new ApiError(400, "Please enter the required fields");
    }
    if (number == null) {
        throw new ApiError(400, "Please enter the quantity of food");
    }

    const food = await Food.findOne({
        $and:[{_id:id},{owner:req.user._id}]

    })
    if (!food) {
        throw new ApiError(404, "Food not found");
    }


    const foodImageLocalPath = req.files?.foodImage?.[0]?.path;
    console.log(foodImageLocalPath);

    if (foodImageLocalPath) {
        const foodImage = await uploadFileInCloudinary(foodImageLocalPath);
        console.log("Food Image Url:", foodImage.url);

        if (!foodImage) {
            throw new ApiError(500, "Image couldn't be updated");
        }

        food.foodImage = foodImage.secure_url;
    }


    food.name = name;
    food.quantity = {
        number,
        units
    }
    food.expiryDate = expiryDate;
    food.status = status;
    food.description = description;
    food.storageLocation = storageLocation;
    food.category = category;

    await food.save();

    // await Food.findByIdAndUpdate(id, {
    //     $set: {
    //         name,
    //         quantity: {
    //             number,
    //             units
    //         },
    //         expiryDate,
    //         status,
    //         description,
    //         storageLocation,
    //         foodImage: 
    //         category,
    //     }
    // })

    return res.status(200).json(new ApiResponse(200, { food }, "Food Item Edited Successfully"));

})


const deleteFoodItem = asyncHandler(async(req,res)=>{
    const {id} = req.params;

        const food = await Food.findOne({
        $and:[{_id:id},{owner:req.user._id}]

    })
    if (!food) {
        throw new ApiError(404, "Food not found");
    }

    const result = await Food.findByIdAndDelete({_id:id});

    if(!result){
        throw new ApiError(500,"Cannot delete food item");
    }

    return res.status(200).json(new ApiResponse(200,{},"Item Deleted Successfully"));

})


const getFoodDetails = asyncHandler(async(req,res)=>{
    const {id} = req.params;

    const food = await Food.findOne({
        $and:[{_id:id},{owner:req.user._id}]

    })
     console.log("Food ID from URL:", id);
    console.log("Logged-in User ID:", req.user._id);

    if(!food){
        throw new ApiError(404,"Food Details not found");
    }

    return res.status(200).json(new ApiResponse(200,{food},"Food data fetched successfully"));

})

const getMyFoodItems = asyncHandler(async (req, res) => {

    const foods = await Food.find({
        owner: req.user._id
    })
    .populate("category");

    if (!foods || foods.length === 0) {
        throw new ApiError(
            404,
            "No food items found in your inventory"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { foods },
            "Food inventory fetched successfully"
        )
    );
});

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

    food.status = "Used";

    await food.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            { food },
            "Food item marked as used successfully"
        )
    );
});

const browseFoodItems = asyncHandler(async (req, res) => {

    const {
        category,
        storageLocation,
        status,
        expiryBefore
    } = req.query;


    // Base query
    const filter = {
        owner: req.user._id
    };


    // Filter by category
    if (category) {
        filter.category = category;
    }


    // Filter by storage location
    if (storageLocation) {
        filter.storageLocation = storageLocation;
    }


    // Filter by status
    if (status) {
        filter.status = status;
    }


    // Filter by expiry date
    if (expiryBefore) {
        filter.expiryDate = {
            $lte: new Date(expiryBefore)
        };
    }


    const foods = await Food.find(filter)
        .populate("category");


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

export { addFoodItem, editFoodItem, deleteFoodItem, getFoodDetails, getMyFoodItems, markFoodAsUsed , browseFoodItems}