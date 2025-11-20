import { Resend } from "resend"
import dotenv from "dotenv"

dotenv.config()

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendVerificationEmail = async (email: string, token: string) => {
    const url = `${process.env.BASE_URL}/api/v1/auth/verify/${token}`
    console.log(url)
    
    try {
        const { data, error } = await resend.emails.send({
            from: "onboarding@resend.dev", // Update this to your verified domain
            to: email,
            subject: "Verify Your Email",
            html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`
        })

        if (error) {
            console.error("Error sending email:", error)
            throw new Error("Failed to send verification email")
        }

        console.log("Email sent successfully", data?.id)
    } catch (error) {
        console.error("Email service error:", error)
        throw error
    }
}