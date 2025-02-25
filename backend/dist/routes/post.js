"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const post_1 = require("../controllers/post");
const authMiddleware_1 = require("../middleware/authMiddleware");
const fileMiddleware_1 = __importDefault(require("../middleware/fileMiddleware"));
const app = express_1.default.Router();
app.post("/create", authMiddleware_1.authMiddleware, fileMiddleware_1.default.array('photos'), post_1.createPost);
app.put("/update", post_1.updatePost);
app.get("/userAll", authMiddleware_1.authMiddleware, post_1.getUserPosts);
app.get("/all", post_1.getAllPosts);
app.get("/:id", post_1.getPostById);
exports.default = app;
