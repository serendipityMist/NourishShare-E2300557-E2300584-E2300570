import { Router } from "express";
import {
    addMealPlanEntry,
    updateMealPlanEntry,
    getMyMealPlans,
    deleteMealPlanEntry
} from "../controllers/mealPlan.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, getMyMealPlans);
router.route("/").post(verifyJWT, addMealPlanEntry);
router.route("/:id").patch(verifyJWT, updateMealPlanEntry);
router.route("/:id").delete(verifyJWT, deleteMealPlanEntry);

export default router;
