import  express  from "express";
import { createProfile, getNative, getOnlineStatus, getProfile, getUser, getUserProfile, getUsers, updateProfile, userSignin, userSignup } from "../controllers/user";
import { authMiddleware } from "../middleware/authMiddleware";

const app = express.Router();

app.post("/signup", userSignup)
app.post("/signin", userSignin)
app.get("/", authMiddleware, getUser)
app.get("/userProfile", authMiddleware, getUserProfile)
app.get("/bulk", authMiddleware, getUsers)
app.post("/profile", authMiddleware, createProfile)
app.put("/profile", authMiddleware, updateProfile)
app.get("/profile", authMiddleware, getProfile)
app.get("/nativeProfile", authMiddleware, getNative)
app.get("/status/:id", authMiddleware, getOnlineStatus)

export default app

