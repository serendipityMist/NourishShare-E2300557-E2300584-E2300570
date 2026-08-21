import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// ======================================================
// CORS CONFIGURATION
// ======================================================

const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const isAllowedOrigin = (origin) => {
    if (!origin) return true;

    if (allowedOrigins.includes(origin)) return true;

    const normalized = origin.toLowerCase();

    return (
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalized) ||
        normalized.endsWith(".vercel.app") ||
        normalized.endsWith(".onrender.com") ||
        normalized.endsWith(".netlify.app") ||
        normalized.endsWith(".pages.dev")
    );
};

console.log("Allowed CORS origins:", allowedOrigins);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests that do not contain an Origin header
            // Example: Postman or server-to-server requests
            if (isAllowedOrigin(origin)) {
                return callback(null, true);
            }

            console.log("Blocked CORS origin:", origin);

            return callback(
                new Error(`CORS blocked origin: ${origin}`)
            );
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        credentials: true,
    })
);

// ======================================================
// BODY PARSING MIDDLEWARE
// ======================================================

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

// ======================================================
// STATIC FILES & COOKIES
// ======================================================

app.use(express.static("public"));

app.use(cookieParser());

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "NourishShare backend is running successfully",
    });
});

// ======================================================
// IMPORT ROUTES
// ======================================================

import userRouter from "./routes/user.routes.js";
import categoryRouter from "./routes/category.routes.js";
import foodRouter from "./routes/food.routes.js";
import donationRouter from "./routes/donation.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import mealPlanRouter from "./routes/mealPlan.routes.js";

// ======================================================
// API ROUTES
// ======================================================

app.use("/api/v1/users", userRouter);

app.use("/api/v1/category", categoryRouter);

app.use("/api/v1/food", foodRouter);

app.use("/api/v1/donation", donationRouter);

app.use("/api/v1/notifications", notificationRouter);

app.use("/api/v1/meal-plans", mealPlanRouter);

// ======================================================
// ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {
    console.error("====================================");
    console.error("BACKEND ERROR");
    console.error("====================================");

    console.error("Message:", err.message);
    console.error("Stack:", err.stack);

    console.error("====================================");

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || [],
    });
});

// ======================================================
// EXPORT APP
// ======================================================

export { app };