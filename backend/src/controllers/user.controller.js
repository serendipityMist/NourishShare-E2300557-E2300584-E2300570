import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiReponse.js";
import { asyncHandler } from "../utils/asyncHandler.js  ";
import { uploadFileInCloudinary } from "../utils/cloudinary.js";
import {v2 as cloudinary} from "cloudinary";
import jwt from "jsonwebtoken";
import { transporter } from "../utils/nodeMailer.js";

//OTP Generator
const generateOTP = () => {
    let otp = "";
    for (let i = 0; i < 6; i++) {
        otp += Math.floor(Math.random() * 10);
    }
    return otp;
}

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, address, age,
        phone,
        gender,
        occupation,
        householdSize,
        malaysianResident,
        twoFAEnabled
    } = req.body;

    if ([
        name,
        email,
        password,
        phone,
        gender,
        occupation,
    ].some(
        ((f) => f?.trim() === "")
    )
    ) {
        throw new ApiError(400, "Please enter all the required field");
    }

    if (age == null || householdSize == null || malaysianResident == null || twoFAEnabled == null) {
        throw new ApiError(400, "Please enter age, householdSize, malaysianResident and twoFAEnabled ");
    }

    console.log(`
        Name: ${name}\n
        Email: ${email}\n
        Password: ${password}\n
        Age: ${age}\n
        Phone: ${phone}\n
        Gender: ${gender}\n
        Occupation: ${occupation}\n
        HouseHoldSize: ${householdSize}\n
        MalaysianResident: ${malaysianResident}\n
        2FA: ${twoFAEnabled}
        `);


    const exisitingUser = await User.findOne({
        $or: [{ phone }, { email }]
    })
    if (exisitingUser) {
        throw new ApiError(409, "User with the phone number or email already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadFileInCloudinary(avatarLocalPath);

    if (!avatar) {
        console.log(avatar);
        throw new ApiError(400, "Avatar is required");
    }

    const user = await User.create({
        name,
        email,
        password,
        address,
        age,
        phone,
        gender,
        occupation,
        householdSize,
        malaysianResident,
        twoFAEnabled,
        // Use Case 1: user must verify OTP before account is active
        isAccountActive: false,
        avatar: avatar.secure_url
    })


    // Use Case 1: send registration verification OTP and keep account inactive
    const otp = generateOTP();
    user.registrationOtp = otp;
    user.registrationOtpExpiry = new Date(Date.now() + 2 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    try {
        const info = await transporter.sendMail({
            from: '"NourishShare Team" <nourish.sharee@gmail.com>',
            to: user.email,
            subject: "Verify your NourishShare account",
            text: `
                Hello ${user.name},
                Welcome to NourishShare.
                Your verification code is:
                ${otp}
                This code is valid for 2 minutes.
                `,
            html: `
                <p>Hello ${user.name}</p>
                <p>Your OTP is</p>
                <h1>${otp}</h1>
`
        });

        console.log("Mail sent:", info);

    } catch (err) {
        console.log("MAIL ERROR");
        console.log(err);
    }

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong");
    }

    res.status(200).json(
        new ApiResponse(200, createdUser, "Account registered. Please verify your email/OTP to activate.")
    );

})

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong");
    }
}

const loginUser = asyncHandler(async (req, res) => {
    const { phone, email, password } = req.body;

    if (!(email || phone)) {
        throw new ApiError(400, "Enter email or phone");
    }

    if (!password) {
        throw new ApiError(400, "Please enter your password");
    }

    const user = await User.findOne({
        $or: [{ phone }, { email }]
    })
    if (!user) {
        throw new ApiError(404, "User is not registered");
    }

    const isPassValid = await user.isPasswordCorrect(password);
    if (!isPassValid) {
        throw new ApiError(400, "Password doesn't match");
    }
    if (user.isAccountActive === false) {
        throw new ApiError(403, "Account is not active. Please verify your email/OTP.");
    }

    if (user.twoFAEnabled == false) {
        //generating access and refresh token
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken -otp -otpExpiry -isOtpVerified");

        //sending cookies
        const options = {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        };

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200,
                {
                    loggedInUser, accessToken, refreshToken
                },
                "User logged in successfully"
            ))
    }
    let otp = generateOTP();
    const info = await transporter.sendMail({
        from: '"NourishShare Team" <nourish.sharee@gmail.com>',
        to: `${user.email}`,
        subject: "Your Login Verification Code",
        text: `
            Hello ${user.name},
            A login attempt was made to your NourishShare account.
            To complete your sign-in, please use the One-Time Password (OTP) below:
            ${otp}
            This OTP is valid for 2 minutes.
            If you did not attempt to log in, please ignore this email or consider changing your password immediately.
            Regards,
            NourishShare Team
            `,
        html: `
                <p>Hello ${user.name},</p>
                <p>A login attempt was made to your <strong>NourishShare</strong> account.</p>
                <p>To complete your sign-in, please use the following One-Time Password (OTP):</p>
                <h1 style="letter-spacing: 5px;">${otp}</h1>
                <p><strong>This OTP is valid for 2 minutes.</strong></p>
                <p>If you did not attempt to log in, please ignore this email or secure your account by changing your password.</p>
                <p>Regards,<br><strong>NourishShare Team</strong></p>
                `
    })
    console.log("Message sent: %s", info.messageId);

    user.otp = otp;
    user.otpExpiry = Date.now() + 2 * 60 * 1000;
    await user.save();

    return res.status(200).json(new ApiResponse(200, {}, "Login Verification OTP Sent Successfully"));


})


const verifyLoginOTP = asyncHandler(async (req, res) => {

    const { email, phone, otp } = req.body;

    if (!(email || phone)) {
        throw new ApiError(400, "Please enter email or phone");
    }

    if (!otp) {
        throw new ApiError(400, "OTP is required");
    }

    const user = await User.findOne({
        $or: [{ email }, { phone }]
    })

    if (!user) {
        throw new ApiError(404, "User doesn't exists");
    }
    if (!user.twoFAEnabled) {
        throw new ApiError(400, "Two FA is not enabled");
    }

    if (Date.now() > user.otpExpiry) {
        throw new ApiError(401, "OTP is expired or incorrect");
    }

    if (otp !== user.otp) {
        throw new ApiError(401, "OTP is incorrect or expired");
    }



    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -otp -otpExpiry -isOtpVerified");

    const options = {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    };

    user.otp = undefined;
    user.isOtpVerified = true;
    user.otpExpiry = undefined;
    await user.save();

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { loggedInUser, accessToken, refreshToken }, "User logged in successfully"));




})


const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        })

    const options = {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    };

    res.status(200)
        .cookie("accessToken", "", options)
        .cookie("refreshToken", "", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingToken) {
        throw new ApiError(401, "Invalid Refresh Token");
    }

    try {
        const decodedToken = await jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRECT);

        const user = await User.findById(decodedToken._id);

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token");
        }

        if (incomingToken != user.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        };
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, {
                accessToken, refreshToken: newRefreshToken
            },
                "Access Token Refreshed")
            )
    } catch (error) {
        throw new ApiError(400, error?.message || "Invalid Refresh Token");
    }

})


//forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
    try {
        const { email, phone } = req.body;
        if (!(email || phone)) {
            throw new ApiError(404, "User not found");
        }

        const userExists = await User.findOne({
            $or: [{ email }, { phone }]
        })
        if (!userExists) {
            throw new ApiError(404, "User doesn't exists.")
        }
        console.log("User: ", userExists);

        console.log("Email: ", userExists.email);

        let otp = generateOTP();
        const info = await transporter.sendMail({
            from: '"NourishShare Team" <nourish.sharee@gmail.com>',
            to: `${userExists.email}`,
            subject: "Change Your Password",
            text: `
            Hello ${userExists.name},
            Please find your OTP for resetting the password below.
            ${otp}
            Regards,
            NourishShare Team
            `,
            html: `
                <p>Hello ${userExists.name},</p>
                <p>Please find your OTP for resetting your password below:</p>
                <h1>${otp}</h1>
                <p>Regards,<br>NourishShare Team</p>
                `
        })
        console.log("Message sent: %s", info.messageId);

        userExists.otp = otp;
        userExists.otpExpiry = Date.now() + 2 * 60 * 1000;
        await userExists.save();

        return res.status(200).json(new ApiResponse(200, {}, "OTP Send Successfully"));

    } catch (error) {
        throw new ApiError(500, error?.message || "Error while sending email")
    }

})


const verifyOTP = asyncHandler(async (req, res) => {
    const { email, phone, otp } = req.body;

    // Check email or phone
    if (!email && !phone) {
        throw new ApiError(
            400,
            "Please enter email or phone number"
        );
    }

    // Check OTP
    if (!otp) {
        throw new ApiError(
            400,
            "OTP is required"
        );
    }

    // Find user
    const user = await User.findOne({
        $or: [
            ...(email ? [{ email }] : []),
            ...(phone ? [{ phone }] : [])
        ]
    });

    if (!user) {
        throw new ApiError(
            404,
            "User not found."
        );
    }

    // Check if registration OTP exists
    if (!user.registrationOtp) {
        throw new ApiError(
            400,
            "No OTP found. Please request a new OTP."
        );
    }

    // Check OTP expiry
    if (
        !user.registrationOtpExpiry ||
        Date.now() > new Date(user.registrationOtpExpiry).getTime()
    ) {
        throw new ApiError(
            400,
            "OTP is expired"
        );
    }

    // Debugging
    console.log("OTP entered by user:", otp);
    console.log("OTP stored in database:", user.registrationOtp);

    // Compare OTP
    if (
        String(otp).trim() !==
        String(user.registrationOtp).trim()
    ) {
        throw new ApiError(
            400,
            "OTP is incorrect or OTP doesn't match"
        );
    }

    // OTP verified
    user.registrationOtp = undefined;
    user.registrationOtpExpiry = undefined;

    // Activate account
    user.isAccountActive = true;

    // If you still want this field
    user.isOtpVerified = true;

    await user.save({
        validateBeforeSave: false
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "OTP is verified and account is activated successfully"
        )
    );
});

const resetPassword = asyncHandler(async (req, res) => {
    try {
        const { email, phone, password } = req.body;
        if (!(email || phone)) {
            throw new ApiError(400, "Please enter email or phone number");
        }


        const user = await User.findOne({
            $or: [{ email }, { phone }]
        })

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (!user.isOtpVerified) {
            throw new ApiError(403, "Please verify OTP first");
        }

        user.password = password;
        user.otp = undefined;
        user.otpExpiry = undefined;
        user.isOtpVerified = false;
        await user.save();

        return res.status(200).json(new ApiResponse(200, {}, "Password changed Successfully"))

    } catch (error) {
        throw new ApiError(500, error?.message || "Password cannot be changed at the moment")
    }
})

const verifyRegistrationOtp = asyncHandler(async (req, res) => {
    const { email, phone, otp, twoFAEnabled } = req.body;

    if (!(email || phone)) {
        throw new ApiError(400, "Please enter email or phone number");
    }

    if (!otp) {
        throw new ApiError(400, "OTP is required");
    }

    const user = await User.findOne({
        $or: [{ email }, { phone }]
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (!user.registrationOtp || !user.registrationOtpExpiry) {
        throw new ApiError(400, "No registration OTP found. Please register again.");
    }

    if (Date.now() > user.registrationOtpExpiry.getTime()) {
        throw new ApiError(401, "OTP is expired");
    }

    if (String(otp) !== String(user.registrationOtp)) {
        throw new ApiError(401, "OTP is incorrect");
    }

    user.registrationOtp = undefined;
    user.registrationOtpExpiry = undefined;

    user.isAccountActive = true;

    // Apply privacy/security after verification
    if (twoFAEnabled != null) {
        user.twoFAEnabled = !!twoFAEnabled;
    } else {
        // keep whatever user already selected during registration
    }

    await user.save({ validateBeforeSave: false });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    res.status(200).json(
        new ApiResponse(200, createdUser, "Account activated successfully")
    );
});

//update profile
const updateProfile = asyncHandler(async (req, res) => {

    const {
        name,
        email,
        address,
        age,
        phone,
        gender,
        occupation,
        householdSize,
        malaysianResident
    } = req.body;

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check duplicate email
    if (email && email !== user.email) {

        const existingEmail = await User.findOne({
            email,
            _id: { $ne: user._id }
        });

        if (existingEmail) {
            throw new ApiError(409, "Email already exists");
        }
    }

    // Check duplicate phone
    if (phone && phone !== user.phone) {

        const existingPhone = await User.findOne({
            phone,
            _id: { $ne: user._id }
        });

        if (existingPhone) {
            throw new ApiError(409, "Phone number already exists");
        }
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (address) user.address = address;
    if (age) user.age = age;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;
    if (occupation) user.occupation = occupation;
    if (householdSize) user.householdSize = householdSize;

    if (malaysianResident !== undefined) {
        user.malaysianResident = malaysianResident;
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
        .select("-password -refreshToken -otp -otpExpiry -registrationOtp -registrationOtpExpiry");

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedUser,
            "Profile updated successfully"
        )
    );

});

//uploadAvatar
const updateAvatar = asyncHandler(async (req, res) => {

    //storing the public id of the image in a variable
    //currently this line will cause error because there is not public id in the avatar there is just url
    const public_id = req.user?.avatar?.public_id;


    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    const avatar = await uploadFileInCloudinary(avatarLocalPath);

    if (!avatar) {
        throw new ApiError(500, "Avatar upload failed");
    }

    if (!public_id) {
        throw new ApiError(400,"Couldn't get the public id of the image");
    }

    //currently this line will cause problem because the pubic id is avaiable
    await cloudinary.uploader.destroy(public_id); 


    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.secure_url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken -otp -otpExpiry -registrationOtp -registrationOtpExpiry");

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "Avatar updated successfully"
        )
    );

});

//changePassword
const changePassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old password and new password are required");
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Old password is incorrect");
    }

    user.password = newPassword;

    await user.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Password changed successfully"
        )
    );

});

//toggleTwoFactor
const toggleTwoFactor = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.twoFAEnabled = !user.twoFAEnabled;

    await user.save({ validateBeforeSave: false });

    const updatedUser = await User.findById(user._id).select(
        "-password -refreshToken -otp -otpExpiry -registrationOtp -registrationOtpExpiry"
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedUser,
            `Two Factor Authentication ${updatedUser.twoFAEnabled ? "enabled" : "disabled"
            } successfully`
        )
    );
});

//getCurrentUser
const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select(
        "-password -refreshToken -otp -otpExpiry -registrationOtp -registrationOtpExpiry -isOtpVerified"
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Current user fetched successfully")
    );
});

const updatePrivacySettings = asyncHandler(async (req, res) => {
    const { foodListingVisibility, twoFAEnabled } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (foodListingVisibility) {
        const allowed = ["Public", "Community", "Private"];
        if (!allowed.includes(foodListingVisibility)) {
            throw new ApiError(400, "Invalid food listing visibility setting");
        }
        user.foodListingVisibility = foodListingVisibility;
    }

    if (twoFAEnabled !== undefined) {
        user.twoFAEnabled = !!twoFAEnabled;
    }

    await user.save({ validateBeforeSave: false });

    const updatedUser = await User.findById(user._id)
        .select("-password -refreshToken -otp -otpExpiry -registrationOtp -registrationOtpExpiry");

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Privacy settings updated successfully")
    );
});

const resendRegistrationOtp = asyncHandler(async (req, res) => {
    const { email, phone } = req.body;

    if (!(email || phone)) {
        throw new ApiError(400, "Please enter email or phone number");
    }

    const user = await User.findOne({
        $or: [{ email }, { phone }]
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isAccountActive) {
        throw new ApiError(400, "Account is already active");
    }

    const otp = generateOTP();
    user.registrationOtp = otp;
    user.registrationOtpExpiry = new Date(Date.now() + 2 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    try {
        await transporter.sendMail({
            from: '"NourishShare Team" <nourish.sharee@gmail.com>',
            to: user.email,
            subject: "Your new NourishShare verification code",
            text: `
                Hello ${user.name},
                Your new verification code is: ${otp}
                This code is valid for 2 minutes.
            `,
            html: `
                <p>Hello ${user.name},</p>
                <p>Your new verification code is:</p>
                <h1>${otp}</h1>
                <p>This code is valid for 2 minutes.</p>
            `
        });
    } catch (err) {
        throw new ApiError(500, "Unable to send verification email. Please try again.");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "A new verification code has been sent to your email")
    );
});

export { registerUser, loginUser, logoutUser, refreshAccessToken, forgotPassword, verifyOTP, resetPassword, verifyLoginOTP, verifyRegistrationOtp, updateAvatar, updateProfile, changePassword, toggleTwoFactor, getCurrentUser, updatePrivacySettings, resendRegistrationOtp };
