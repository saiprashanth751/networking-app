import express from "express"
import { authMiddleware } from "../middleware/authMiddleware"
import { followUser, getFollowers, getFollowing, unfollowUser } from "../controllers/follow"

const app = express.Router()

app.post("/", authMiddleware, followUser)
app.delete("/", authMiddleware, unfollowUser)
app.get("/followers", authMiddleware, getFollowers)
app.get("/following", authMiddleware, getFollowing)
export default app