import express from "express"
import { authMiddleware } from "../middleware/authMiddleware"
import {
    followUser,
    getFollowers,
    getFollowing,
    getNativeFollowers,
    getNativeFollowing,
    getStatus,
    unfollowUser,
    getMutualConnections,
    removeFollower
} from "../controllers/follow"
import { getRecommendedUsers } from "../controllers/followRecommendations"

const app = express.Router()

// Follow/Unfollow actions (with query params)
app.post("/", authMiddleware, followUser)
app.delete("/", authMiddleware, unfollowUser)
app.get("/", authMiddleware, getStatus)

// Current user's followers/following
app.get("/followers", authMiddleware, getFollowers)
app.get("/following", authMiddleware, getFollowing)

// Other user's followers/following (by query param)
app.get("/userFollowers", authMiddleware, getNativeFollowers)
app.get("/userFollowing", authMiddleware, getNativeFollowing)

// New features - Connection management
app.get("/mutual/:userId", authMiddleware, getMutualConnections)
app.delete("/remove-follower/:followerId", authMiddleware, removeFollower)

// Recommendations
app.get("/recommended", authMiddleware, getRecommendedUsers)

export default app;