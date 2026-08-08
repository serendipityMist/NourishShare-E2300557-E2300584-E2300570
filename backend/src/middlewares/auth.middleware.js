import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
export const verifyJWT = asyncHandler(async (req, res, next) => {
        try {
            const cookieToken = req.cookies?.accessToken;
            const headerToken = req.header("Authorization")?.replace(/^Bearer\s+/i, "")?.trim();
            const token = headerToken || cookieToken;

            if (!token) {
                throw new ApiError(401, "Unauthorized Request");
            }
    
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
            const user = await User.findById(decodedToken._id).select("-password -refreshToken");
    
            if (!user) {
                throw new ApiError(401, "Invalid Access Token");
            }
            if (user.isAccountActive === false) {
                throw new ApiError(403, "Account is not active. Please verify your email/OTP.");
            }
            req.user = user;
            next();
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                throw new ApiError(401, "Access token expired");
            }
            throw new ApiError(401, error?.message || "Invalid Access Token");
        }
})