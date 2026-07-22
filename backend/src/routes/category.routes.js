import {Router} from "express";
import { getCategories } from "../controllers/category.controller.js";

const router = Router();

router.route("/getCategories").get(getCategories);

export default router;