import { Router } from "express";
import {
    addMealPlanEntry,
    updateMealPlanEntry,
    getMyMealPlans,
    deleteMealPlanEntry
} from "../controllers/mealPlan.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, getMyMealPlans);
router.post(
    "/",
    verifyJWT,
    upload.single("mealImage"),
    addMealPlanEntry
);
router.route("/:id").patch(verifyJWT,    upload.single("mealImage"),updateMealPlanEntry);
router.route("/:id").delete(verifyJWT, deleteMealPlanEntry);

export default router;
