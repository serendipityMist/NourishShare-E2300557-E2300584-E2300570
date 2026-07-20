import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiReponse.js";
import { asyncHandler } from "../utils/asyncHandler.js  ";
import { uploadFileInCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { transporter } from "../utils/nodeMailer.js";

//OTP Generator
const generateOTP = (req, res) => {
    let otp = "";

    for (let i = 0; i < 6; i++) {
        let num = Math.floor(Math.random() * 10);
        console.log(num);
        otp += num;
    }
    console.log("OTP :", otp);
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
        (f) => { f?.trim() === "" }
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

    const avatarLocalPath = req.files?.avatar[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar tis required");
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
        avatar: avatar.secure_url
    })


    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong");
    }

    res.status(200).json(new ApiResponse(200, createdUser, "User registered Successfully"));

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

    if(!password){
        throw new ApiError(400,"Please enter your password");
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
    if (user.twoFAEnabled == false) {
        //generating access and refresh token
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken -otp -otpExpiry -isOtpVerified");

        //sending cookies
        const options = {
            httpOnly: true,
            secure: true
        }

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

    return res.status(200).json(new ApiResponse(200,{},"Login Verification OTP Sent Successfully"));


})


const verifyLoginOTP = asyncHandler(async(req,res)=>{
    
    const {email,phone,otp} = req.body;

    if(!(email || phone)){
        throw new ApiError(400,"Please enter email or phone");
    }
   
    if(!otp){
        throw new ApiError(400,"OTP is required");
    }

    const user = await User.findOne({
        $or:[{email},{phone}]
    })

    if(!user){
        throw new ApiError(404, "User doesn't exists");
    }
     if(!user.twoFAEnabled){
        throw new ApiError(400,"Two FA is not enabled");
    }

     if(Date.now()>user.otpExpiry){
        throw new ApiError(401,"OTP is expired");
    }

    if(otp !== user.otp){
        throw new ApiError(401,"OTP is incorrect");
    }

   

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);
    
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -otp -otpExpiry -isOtpVerified");
    
    const options = {
        httpOnly:true,
        secure:true
    }

    user.otp = undefined;
    user.isOtpVerified = true;
    user.otpExpiry=undefined;
    await user.save();

    return res.status(200)
                .cookie("accessToken",accessToken,options)
                .cookie("refreshToken",refreshToken,options)
                .json(new ApiResponse(200,{loggedInUser,accessToken,refreshToken},"User logged in successfully"));
    



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
        secure: true
    }

    res.status(200)
        .cookie("accessToken", options)
        .cookie("refreshToken", options)
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
            secure: true
        }
        const { accessToken, freshRefreshToken } = await generateAccessAndRefreshToken(user._id);

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", freshRefreshToken, options)
            .json(new ApiResponse(200, {
                accessToken, freshRefreshToken
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
    try {
        const { email, phone, otp } = req.body;
        if (!(email || phone)) {
            throw new ApiError(400, "Please enter email or phone number");
        }

        if (!otp) {
            throw new ApiError(400, "OTP is required");
        }

        const user = await User.findOne({
            $or: [{ email }, { phone }]
        })

        if (!user) {
            throw new ApiError(404, "User not found.")
        }
        //checking for OTP 
        if (Date.now() > user.otpExpiry) {
            throw new ApiError(400, "OTP is expired");
        }

        if (otp != user.otp) {
            throw new ApiError(400, "OTP is incorrect or OTP doesn't match");
        }

        user.otp = undefined;
        user.isOtpVerified = true;
        user.otpExpiry = undefined;
        await user.save();

        return res.status(200)
            .json(new ApiResponse(200, {}, "OTP is verified"));

    } catch (error) {
        throw new ApiError(500, error?.message || "OTP verfification failed");
    }
})

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

export { registerUser, loginUser, logoutUser, refreshAccessToken, forgotPassword, verifyOTP, resetPassword , verifyLoginOTP};