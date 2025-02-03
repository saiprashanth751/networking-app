import  express  from "express";
import { userProfile, userSignin, userSignup } from "../controllers/user";
import { authMiddleware } from "../middleware/authMiddleware";

const app = express.Router();

app.post("/signup", userSignup)
app.post("/signin", userSignin)
app.post("/profile", authMiddleware, userProfile)

export default app

