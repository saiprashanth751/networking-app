import express from "express"
import { authMiddleware } from "../middleware/authMiddleware"
import { verifyEmail } from "../controllers/auth"

const app = express.Router()

app.get("/verify/:id",verifyEmail)

export default app