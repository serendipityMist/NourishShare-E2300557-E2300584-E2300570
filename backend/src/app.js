import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// =========================
// CORS Configuration
// =========================

const allowedOrigins = process.env.CORS_ORIGIN
    .split(",")
    .map((origin) => origin.trim());

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests such as Postman/server-to-server
            // that do not contain an Origin header
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

// =========================
// Middleware
// =========================

app.use(
    express.json({
        limit: "16kb",
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "16kb",
    })
);

app.use(express.static("public"));
app.use(cookieParser());

// =========================
// Health Check
// =========================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "NourishShare backend is running successfully",
    });
});

// =========================
// Routes
// =========================

import userRouter from "./routes/user.routes.js";
import categoryRouter from "./routes/category.routes.js";
import foodRouter from "./routes/food.routes.js";
import donationRouter from "./routes/donation.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import mealPlanRouter from "./routes/mealPlan.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/food", foodRouter);
app.use("/api/v1/donation", donationRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/meal-plans", mealPlanRouter);

// =========================
// Error Handler
// =========================

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    const responseBody = {
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || [],
    };

    if (process.env.NODE_ENV !== "production") {
        responseBody.stack = err.stack;
    }

    res.status(statusCode).json(responseBody);
});

export { app };