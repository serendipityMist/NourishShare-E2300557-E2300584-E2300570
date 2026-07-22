import { Router } from "express";
import {
    getMyNotifications,
    markNotificationRead,
    markAllNotificationsRead
} from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, getMyNotifications);
router.route("/read-all").patch(verifyJWT, markAllNotificationsRead);
router.route("/:id/read").patch(verifyJWT, markNotificationRead);

export default router;
