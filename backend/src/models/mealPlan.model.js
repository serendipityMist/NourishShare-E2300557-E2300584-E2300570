import mongoose from "mongoose";

const mealPlanSchema = new mongoose.Schema({
    weekStartDate:{
        type: Date,
        required:true
    },
    mealType:{
        type: String,
        enum:["Breakfast","Lunch","Dinner"],
        required:true
    },
    day:{
        type:String,
        required:true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    food:{
        type: mongooose.Schema.Types.ObjectId,
        ref:"Food"
    }

},{timestamps:true});

export const MealPlan = mongoose.model("MealPlan",mealPlanSchema);