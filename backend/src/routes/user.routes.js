import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser, resetPassword } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        }
    ]),
    registerUser);


//login
router.route("/login").post(loginUser);
//secure routes
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refreshToken").post(refreshAccessToken);  
router.route("/resetPassword").post(resetPassword);  

export default router;