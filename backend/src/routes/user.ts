import  express  from "express";
import { createProfile, getNative, getOnlineStatus, getProfile, getUser, getUserByName, getUserProfile, getUsers, updateProfile, userSignin, userSignup } from "../controllers/user";
import { authMiddleware } from "../middleware/authMiddleware";
import upload from "../middleware/fileMiddleware";

const app = express.Router();

app.post("/signup", userSignup)
app.post("/signin", userSignin)
app.get("/", authMiddleware, getUser)
app.get("/userProfile", authMiddleware, getUserProfile)
app.get("/bulk", authMiddleware, getUsers)
app.post("/profile", authMiddleware, upload.single('profilePic') , createProfile)
app.put("/profile", authMiddleware, upload.single('profilePic'), updateProfile)
app.get("/profile", authMiddleware, getProfile)
app.get("/nativeProfile", authMiddleware, getNative)
app.get("/status/:id", authMiddleware, getOnlineStatus)
app.get("/search", authMiddleware, getUserByName )

export default app

