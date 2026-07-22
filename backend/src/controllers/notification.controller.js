import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiReponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getMyNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ owner: req.user._id })
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            { notifications },
            notifications.length
                ? "Notifications fetched successfully"
                : "No notifications found"
        )
    );
});

const markNotificationRead = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const notification = await Notification.findOne({
        _id: id,
        owner: req.user._id
    });

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json(
        new ApiResponse(200, { notification }, "Notification marked as read")
    );
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { owner: req.user._id, isRead: false },
        { $set: { isRead: true } }
    );

    return res.status(200).json(
        new ApiResponse(200, {}, "All notifications marked as read")
    );
});

export {
    getMyNotifications,
    markNotificationRead,
    markAllNotificationsRead
};
