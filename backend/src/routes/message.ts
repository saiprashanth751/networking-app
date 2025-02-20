import express from "express"
import { getMessages, sendMessage } from "../controllers/message";
import { authMiddleware } from "../middleware/authMiddleware";

const app = express.Router()

app.post("/send",authMiddleware ,sendMessage)
app.get("/:id", authMiddleware, getMessages)

export default app;