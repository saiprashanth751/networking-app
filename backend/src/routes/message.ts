import express from "express"
import { getMessages, markMessagesAsRead, sendMessage } from "../controllers/message";
import { authMiddleware } from "../middleware/authMiddleware";

const app = express.Router()

app.post("/send",authMiddleware ,sendMessage)
app.get("/:id", authMiddleware, getMessages)
app.put("/read/:id", authMiddleware, markMessagesAsRead)

export default app;