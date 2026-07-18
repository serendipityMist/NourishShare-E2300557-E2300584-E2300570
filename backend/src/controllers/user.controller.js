import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiReponse.js";
import { asyncHandler } from "../utils/asyncHandler.js  ";
import { uploadFileInCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

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

    if (!(email || password)) {
        throw new ApiError(400, "Enter email or password");
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
    //generating access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

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

        const options={
            httpOnly:true,
            secure:true
        }

        res.status(200)
            .cookie("accessToken",options)
            .cookie("refreshToken",options)
            .json(new ApiResponse(200,{},"User logged out successfully"));
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if(!incomingToken){
        throw new ApiError(401,"Invalid Refresh Token");
    }

    const decodedToken = await jwt.verify

})

export { registerUser, loginUser,logoutUser };