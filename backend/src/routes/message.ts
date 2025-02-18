import express from "express"
import { createMessage, getMessages } from "../controllers/message";
import { authMiddleware } from "../middleware/authMiddleware";

const app = express.Router()

app.post("/send", createMessage)
app.get("/:id", authMiddleware, getMessages)

export default app;