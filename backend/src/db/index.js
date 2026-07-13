import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { setServers } from "node:dns";
setServers(["1.1.1.1", "8.8.8.8"]);

const connectDB = async()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_DB_URI}/${DB_NAME}`);
        console.log(`MongoDB Connected Successfully ${connectionInstance.connection.name}`);
    } catch (error) {
        console.log(`MongoDB Connection  ${error}`);
        process.exit(1);
        
    }
}

export {connectDB};