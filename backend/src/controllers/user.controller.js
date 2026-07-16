import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js  ";



const registerUser = asyncHandler(async(req,res)=>{
    const {name, email, password, address, age,
        phone,
        gender,
        occupation,
        householdSize,
        malaysianResident,
        twoFAEnabled
    } = req.body;
   
        if([
            name,
            email,
            password,
            phone,
            gender,
            occupation,
        ].some(
            (f)=> {f?.trim()===""}
        )
        ){
                throw new ApiError(400,"Please enter all the required field");
        }

        if(age==null || householdSize==null || malaysianResident ==null || twoFAEnabled==null){
            throw new ApiError(400,"Please enter age, householdSize, malaysianResident and twoFAEnabled ");
        }

        console.log(`
        Name: ${name}\n
        Email: ${email}\n
        Password: ${password}\n
        Age: ${age}\n
        Phone: ${phone}\n
        Gender: ${gender}\n
        Occupation: ${occupation}\n
        HouseHoldSize: ${householdSize}\n
        MalaysianResident: ${malaysianResident}\n
        2FA: ${twoFAEnabled}
        `);
              

    
})

export {registerUser};