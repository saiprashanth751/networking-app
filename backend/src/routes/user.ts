import  express  from "express";
import { userSignin, userSignup } from "../controllers/user";

const app = express.Router();

app.post("/signup", userSignup)
app.post("/signin", userSignin)

export default app

