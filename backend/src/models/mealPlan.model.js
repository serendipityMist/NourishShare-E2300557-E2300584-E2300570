import mongoose from "mongoose";

const mealPlanSchema = new mongoose.Schema({
    weekStartDate:{
        type: Date,
        required:true
    },
    day:{
        type:String,
        enum:[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
        ],
        required:true
    },
    mealType:{
        type: String,
        enum:["Breakfast","Lunch","Dinner"],
        required:true
    },
    mealName:{
        type:String,
        trim:true,
        required:true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    food:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Food"
    }]

},{timestamps:true});

export const MealPlan = mongoose.model("MealPlan",mealPlanSchema);