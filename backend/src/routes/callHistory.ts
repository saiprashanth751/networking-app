import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getCallHistory,
  getUserCallHistory,
  deleteCallHistory
} from "../controllers/callHistory";

const router = express.Router();

// Get call history for current user
router.get("/", authMiddleware, getCallHistory);

// Get call history with a specific user
router.get("/user/:userId", authMiddleware, getUserCallHistory);

// Delete call history entry (soft delete)
router.delete("/:callId", authMiddleware, deleteCallHistory);

export default router;