import express from "express";
import { createPost, getAllPosts, getPostById, getUserPosts, updatePost } from "../controllers/post";
import { authMiddleware } from "../middleware/authMiddleware";
import upload, { uploadToCloudinary } from '../middleware/fileMiddleware'

const app = express.Router();

// POST /api/v1/post - Create new post (with Lexical JSON, categoryIds, tags)
app.post("/", authMiddleware, upload.array('photos'), uploadToCloudinary('photos'), createPost);

// PUT /api/v1/post/:id - Update post
app.put("/:id", authMiddleware, updatePost);

// GET /api/v1/post/user - Get current user's posts
app.get("/user", authMiddleware, getUserPosts);

// GET /api/v1/post - Get all posts (feed)
app.get("/", getAllPosts);

// GET /api/v1/post/:id - Get single post
app.get("/:id", getPostById);

export default app;