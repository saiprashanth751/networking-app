"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const follow_1 = require("../controllers/follow");
const app = express_1.default.Router();
app.post("/:id", authMiddleware_1.authMiddleware, follow_1.followUser);
app.delete("/:id", authMiddleware_1.authMiddleware, follow_1.unfollowUser);
exports.default = app;
