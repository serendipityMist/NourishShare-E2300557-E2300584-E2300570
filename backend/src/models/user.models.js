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
    avatar:{ // we will use cloudinary to upload the image and then get the URL 
        type:String,
        required:true
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
        enumu:["Male","Female","Other"]
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
    twoFAEnabled:{
        type: Boolean,
        required: true
    }
},{timestamps:true});


//need to check this part if it is working or i am missing something
userSchema.pre("save",function (){
    bcrypt.hash(this.password,10);
})

export const User = mongoose.model("User",userSchema);