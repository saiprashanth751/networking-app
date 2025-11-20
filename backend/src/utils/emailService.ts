import * as brevo from '@getbrevo/brevo'
import dotenv from "dotenv"

dotenv.config()

const apiInstance = new brevo.TransactionalEmailsApi()
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY!)

export const sendVerificationEmail = async (email: string, token: string) => {
    const url = `${process.env.BASE_URL}/api/v1/auth/verify/${token}`
    console.log(url)
    
    const sendSmtpEmail = new brevo.SendSmtpEmail()
    sendSmtpEmail.subject = "Verify Your Email"
    sendSmtpEmail.htmlContent = `<p>Click <a href="${url}">here</a> to verify your email.</p>`
    sendSmtpEmail.sender = { name: "Uni Network", email: "saiprashanth751@gmail.com" }
    sendSmtpEmail.to = [{ email: email }]

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail)
        console.log("Email sent successfully", data.body.messageId)
    } catch (error) {
        console.error("Error sending email:", error)
        throw new Error("Failed to send verification email")
    }
}