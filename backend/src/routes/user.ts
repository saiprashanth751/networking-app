import  express  from "express";
import { createProfile, updateProfile, userSignin, userSignup } from "../controllers/user";
import { authMiddleware } from "../middleware/authMiddleware";

const app = express.Router();

app.post("/signup", userSignup)
app.post("/signin", userSignin)
app.post("/profile", authMiddleware, createProfile)
app.put("/profile", authMiddleware, updateProfile)

export default app

