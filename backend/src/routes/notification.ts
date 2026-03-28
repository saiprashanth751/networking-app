import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    markAsSeen,
    deleteNotification,
    getPreferences,
    updatePreferences,
    registerFCMToken,
    removeFCMToken
} from "../controllers/notification";

const app = express.Router();

// Notification CRUD
app.get("/", authMiddleware, getNotifications);
app.get("/unread", authMiddleware, getUnreadCount);
app.post("/:id/read", authMiddleware, markAsRead);
app.post("/read-all", authMiddleware, markAllAsRead);
app.post("/:id/seen", authMiddleware, markAsSeen);
app.delete("/:id", authMiddleware, deleteNotification);

// Preferences
app.get("/preferences", authMiddleware, getPreferences);
app.put("/preferences", authMiddleware, updatePreferences);

// FCM Push Notifications
app.post("/register", authMiddleware, registerFCMToken);
app.post("/unregister", authMiddleware, removeFCMToken);

export default app;
