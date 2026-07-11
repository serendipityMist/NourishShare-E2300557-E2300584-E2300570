import mongoose  from "mongoose";

const donationSchema = new mongoose.Schema({
    expiryDate:{
        type: Date,
        required: true
    },
    pickUpLocation:{
        type:String,
        required:true
    },
    availabilityTime:{
        type: String,
        required:true
    },
    status:{
        type:String,
        enum:["Available","Upcoming","Claimed"],
        required:true
    },
    donor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    food:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Food"
    },
    claimedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true});

export const Donation = mongoose.model("Donation",donationSchema);