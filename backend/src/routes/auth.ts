import express from "express"
import { verifyEmail } from "../controllers/auth"

const app = express.Router()

app.get("/verify/:token",verifyEmail)

export default app