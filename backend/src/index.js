import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./db/index.js";
import { app } from "./app.js";
import { scheduleExpiryNotifications } from "./utils/expiryNotifier.js";
import { scheduleMealReminders } from "./utils/mealReminderNotifier.js";

const PORT = process.env.PORT || 7000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running at PORT ${PORT}`);
        });

        // Start daily expiry notifications
        scheduleExpiryNotifications();

        // Start meal reminders
        scheduleMealReminders();
    })
    .catch((err) => {
        console.log(`MongoDB Connection error: ${err}`);
    });