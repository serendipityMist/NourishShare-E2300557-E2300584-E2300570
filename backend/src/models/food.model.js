import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        index:true
    }
},{timestamps:true})