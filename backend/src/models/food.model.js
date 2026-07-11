import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    foodImage:{ // we will use cloudinary to upload the image and get the URL
        type:String,
        requied:true
    },
    quantity:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        enum:["Available","Reserved","Donated","Used"],
        required:true
    },
    description:{
        type:String,
        required:true
    },
    storageLocation:{
        type:String,
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category"
    }
},{timestamps:true});

export const Food = mongoose.model("Food",foodSchema);