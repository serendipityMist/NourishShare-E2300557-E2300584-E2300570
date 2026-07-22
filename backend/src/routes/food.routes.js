import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { addFoodItem, browseFoodItems, deleteFoodItem, editFoodItem, getFoodDetails, getMyFoodItems, markFoodAsUsed } from "../controllers/food.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//add food item
router.route("/addFoodItem").post(verifyJWT,
    upload.fields(
    [
        {
            name: "foodImage",
            maxCount: 1
        }
    ],
),addFoodItem
)
router.route("/editFoodItem/:id").put(verifyJWT,upload.fields(
    [
        {
            name:"foodImage",
            maxCount:1
        }
    ]
),editFoodItem
)
router.route("/deleteFoodItem/:id").delete(verifyJWT,deleteFoodItem);
router.route("/getFoodDetails/:id").get(verifyJWT,getFoodDetails);
router.route("/getMyFoodItems").get(
    verifyJWT,
    getMyFoodItems
);
router.route("/markAsUsed/:id").patch(
    verifyJWT,
    markFoodAsUsed
);

router.route("/browseFoodItems").get(
    verifyJWT,
    browseFoodItems
);

export default router;