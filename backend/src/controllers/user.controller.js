import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiReponse.js";
import { asyncHandler } from "../utils/asyncHandler.js  ";
import { uploadFileInCloudinary } from "../utils/cloudinary.js";


const registerUser = asyncHandler(async(req,res)=>{
    const {name, email, password, address, age,
        phone,
        gender,
        occupation,
        householdSize,
        malaysianResident,
        twoFAEnabled
    } = req.body;
   
        if([
            name,
            email,
            password,
            phone,
            gender,
            occupation,
        ].some(
            (f)=> {f?.trim()===""}
        )
        ){
                throw new ApiError(400,"Please enter all the required field");
        }

        if(age==null || householdSize==null || malaysianResident ==null || twoFAEnabled==null){
            throw new ApiError(400,"Please enter age, householdSize, malaysianResident and twoFAEnabled ");
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
            $or:[{phone},{email}]
        })
        if(exisitingUser){
            throw new ApiError(409,"User with the phone number or email already exists");
        }

        const avatarLocalPath = req.files?.avatar[0]?.path;

        if(!avatarLocalPath){
            throw new ApiError(400,"Avatar tis required");
        }

        const avatar = await uploadFileInCloudinary(avatarLocalPath);

        if(!avatar){
            console.log(avatar);
            throw new ApiError(400,"Avatar is required");
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

        if(!createdUser){
            throw new ApiError(500,"Something went wrong");
        }

        res.status(200).json(new ApiResponse(200,"User registered Successfully"));

})

export {registerUser};