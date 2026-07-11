import mongoose from "mongoose";

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

export const User = mongoose.model("User",userSchema);