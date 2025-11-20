"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const follow_1 = require("../controllers/follow");
const app = express_1.default.Router();
app.post("/", authMiddleware_1.authMiddleware, follow_1.followUser);
app.delete("/", authMiddleware_1.authMiddleware, follow_1.unfollowUser);
app.get("/", authMiddleware_1.authMiddleware, follow_1.getStatus);
app.get("/followers", authMiddleware_1.authMiddleware, follow_1.getFollowers);
app.get("/userFollowers", authMiddleware_1.authMiddleware, follow_1.getNativeFollowers);
app.get("/following", authMiddleware_1.authMiddleware, follow_1.getFollowing);
app.get("/userFollowing", authMiddleware_1.authMiddleware, follow_1.getNativeFollowing);
exports.default = app;
