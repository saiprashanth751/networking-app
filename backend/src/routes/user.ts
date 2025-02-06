import  express  from "express";
import { createProfile, getProfile, getUser, getUsers, updateProfile, userSignin, userSignup } from "../controllers/user";
import { authMiddleware } from "../middleware/authMiddleware";

const app = express.Router();

app.post("/signup", userSignup)
app.post("/signin", userSignin)
app.get("/", authMiddleware, getUser)
app.get("/bulk", authMiddleware, getUsers)
app.post("/profile", authMiddleware, createProfile)
app.put("/profile", authMiddleware, updateProfile)
app.get("/profile", authMiddleware, getProfile)

export default app

