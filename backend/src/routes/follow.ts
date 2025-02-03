import express from "express"
import { authMiddleware } from "../middleware/authMiddleware"
import { followUser, unfollowUser } from "../controllers/follow"

const app = express.Router()

app.post("/:id", authMiddleware, followUser)
app.delete("/:id", authMiddleware, unfollowUser)

export default app