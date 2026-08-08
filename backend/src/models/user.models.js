import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        index:true,
        lowercase:true,
        trim:true,
        required:true
    },
    email:{
        type:String,
        lowercase:true,
        trim:true,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true,
        trim:true
    },
    avatar: {
        type: String,
        trim: true,
        default: "",
        set: (value) => {
            if (!value) return "";
            if (typeof value === "string") return value;
            if (typeof value === "object") return value.secure_url || value.url || "";
            return String(value);
        }
    },
    age:{
        type:Number,
        required:true
    },
    phone:{
        type: String,
        required: true
    },
    gender:{
        type:String,
        required:true,
        enum:["Male","Female","Other"]
    },
    occupation:{
        type:String,
        required:true
    },
    householdSize:{
        type: Number,
        required: true
    },
    malaysianResident:{
        type: Boolean,
        required:true,
        default: true
    },
    // Privacy/Security
    twoFAEnabled:{
        type: Boolean,
        required: true,
        default: false
    },
    foodListingVisibility:{
        type: String,
        enum: ["Public", "Community", "Private"],
        default: "Community",
        required: true
    },
    // Account becomes active only after registration/email verification
    isAccountActive:{
        type: Boolean,
        default: false
    },

    refreshToken:{
        type:String
    },

    // Login OTP (2FA)
    otp:{
        type:String
    },
    otpExpiry:{
        type:Date
    },
    isOtpVerified:{
        type:Boolean,
        default:false
    },

    // Registration verification OTP (Use Case 1)
    registrationOtp:{
        type:String
    },
    registrationOtpExpiry:{
        type:Date
    }
},{timestamps:true});


//need to check this part if it is working or i am missing something
//fixed it
userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password,10);
})

//custom hook to check whether the password is same or not after hashing
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            name: this.name,
            email: this.email,
            age: this.age,
            phone: this.phone,
            occupation: this.occupation,
            twoFAEnabled: this.twoFAEnabled,
            householdSize: this.householdSize,
            malaysianResident: this.malaysianResident
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRECT,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema);