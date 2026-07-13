import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})


const uploadFileInCloudinary = async(localfilepath)=>{
    try {
        const response = await cloudinary.uploader.upload(localfilepath,{resource_type:"auto"});
        console.log(`File Response from cloudinary ${response}`);
        return response;
    } catch (error) {
        fs.unlinkSync(localfilepath);
        return null;
    }
}

