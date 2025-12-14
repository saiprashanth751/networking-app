// backend/routes/conversation.ts
import express from "express";
import { 
    getConversations, 
    getOrCreateConversation,
    getUnreadCount,
    searchConversations
} from "../controllers/conversation";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authMiddleware, getConversations);
router.get("/unread-count", authMiddleware, getUnreadCount);
router.get("/search", authMiddleware, searchConversations);
router.get("/:userId", authMiddleware, getOrCreateConversation);

export default router;