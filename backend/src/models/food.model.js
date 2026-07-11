import mongoose from "mongoose";

const foodQuantitySchema = new mongoose.Schema({
    number:{
        type:Number,
        required:true,
        min:1
    },
    units:{
        type: String,
        enum:["KG","g","L","ml","Pieces","Packets","Boxes","Bottles","Cans"],
        required:true
    }
});

const foodSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    foodImage:{ // we will use cloudinary to upload the image and get the URL
        type:String,
        required:true
    },
    quantity:foodQuantitySchema,
    expiryDate:{
        type:Date,
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
        enum:["Refrigerator","Pantry","Freezer"],
        default:"Refrigerator",
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps:true});

export const Food = mongoose.model("Food",foodSchema);