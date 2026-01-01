import express from "express"
import { 
    getMessages, 
    getMessagesPaginated,
    markMessagesAsRead, 
    sendMessage, 
    uploadMessageFile 
} from "../controllers/message";
import { authMiddleware } from "../middleware/authMiddleware";
import upload, { uploadToCloudinary } from "../middleware/fileMiddleware";

const app = express.Router()

app.post("/send", authMiddleware, sendMessage)

// IMPORTANT: Paginated endpoint should come BEFORE the /:id endpoint
app.get("/paginated/:id", authMiddleware, getMessagesPaginated)

// Regular get messages (fallback)
app.get("/:id", authMiddleware, getMessages)

app.put("/read/:id", authMiddleware, markMessagesAsRead)

// File upload route
app.post(
    "/upload", 
    authMiddleware, 
    upload.single('file'),
    uploadToCloudinary('message-files'),
    uploadMessageFile
)

export default app;