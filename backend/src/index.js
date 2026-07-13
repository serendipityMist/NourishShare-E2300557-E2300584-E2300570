import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./db/index.js";
import { app } from "./app.js";


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 7000,()=>{
        console.log(`Server is running at PORT ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log(`MongoDB Connection error ${err}`);
    
})
