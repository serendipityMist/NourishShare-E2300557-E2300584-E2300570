import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    notificationType: {
        type: String,
        enum: ["Expiry", "Donation", "Meal", "Account"],
        required: true
    },
    isRead: {
        type: Boolean,
        default: false,
        required: true
    }
}, { timestamps: true });

export const Notification = mongoose.model("Notification", notificationSchema);