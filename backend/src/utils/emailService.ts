import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

export const sendVerificationEmail = async (email:string, token:string) => {
    console.log(process.env.BASE_URL)
    const url = `${process.env.BASE_URL}/api/v1/auth/verify/${token}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify Your Email",
        html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`
    };
    console.log("Sending Verification Email")
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully", info.messageId)

};