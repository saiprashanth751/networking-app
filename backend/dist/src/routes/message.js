"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const message_1 = require("../controllers/message");
const authMiddleware_1 = require("../middleware/authMiddleware");
const app = express_1.default.Router();
app.post("/send", authMiddleware_1.authMiddleware, message_1.sendMessage);
app.get("/:id", authMiddleware_1.authMiddleware, message_1.getMessages);
app.put("/read/:id", authMiddleware_1.authMiddleware, message_1.markMessagesAsRead);
exports.default = app;
