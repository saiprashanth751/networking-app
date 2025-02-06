import express from "express"
import { authMiddleware } from "../middleware/authMiddleware"
import { followUser, getFollowers, getFollowing, getNativeFollowers, getNativeFollowing, getStatus, unfollowUser } from "../controllers/follow"

const app = express.Router()

app.post("/", authMiddleware, followUser)
app.delete("/", authMiddleware, unfollowUser)
app.get("/", authMiddleware, getStatus)
app.get("/followers", authMiddleware, getFollowers)
app.get("/userFollowers", authMiddleware, getNativeFollowers)
app.get("/following", authMiddleware, getFollowing)
app.get("/userFollowing", authMiddleware, getNativeFollowing)
export default app