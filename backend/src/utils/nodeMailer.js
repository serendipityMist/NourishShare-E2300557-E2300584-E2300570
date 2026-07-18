import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service:"gmail",
    port:587,
    secure:false,
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})
export {transporter};