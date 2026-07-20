import { Router } from "express";
import { forgotPassword, loginUser, logoutUser, refreshAccessToken,updateProfile,
    updateAvatar, registerUser, resetPassword, verifyLoginOTP, verifyOTP, changePassword, toggleTwoFactor,verifyRegistrationOtp } from "../controllers/user.controller.js";
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
router.route("/verifyLogin").post(verifyLoginOTP);
//secure routes
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refreshToken").post(refreshAccessToken);  
router.route("/forgotPassword").post(forgotPassword);  
router.route("/verifyOTP").post(verifyOTP);
router.route("/resetPassword").post(resetPassword);
router.route("/verifyRegistrationOtp").post(verifyRegistrationOtp);

router.route("/updateProfile")
.patch(
    verifyJWT,
    updateProfile
);

router.route("/updateAvatar")
.patch(
    verifyJWT,
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
    ]),
    updateAvatar
);

router.route("/changePassword")
.patch(
    verifyJWT,
    changePassword
);

router.route("/toggle2FA")
.patch(
    verifyJWT,
    toggleTwoFactor
);

export default router;