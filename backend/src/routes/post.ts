import express from "express";
import { createPost, createDraft, publishPost, deletePost, getAllPosts, getPostById, getUserPosts, getPostsByUserId, updatePost } from "../controllers/post";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/authMiddleware";
import upload, { uploadToCloudinary } from '../middleware/fileMiddleware'

const app = express.Router();

// POST /api/v1/post/draft - Create draft post (Production Workflow Step 1)
app.post("/draft", authMiddleware, createDraft);

// PATCH /api/v1/post/:postId/publish - Publish draft post (Production Workflow Step 3)
app.patch("/:postId/publish", authMiddleware, publishPost);

// DELETE /api/v1/post/:id - Delete post (cleanup for failed drafts)
app.delete("/:id", authMiddleware, deletePost);

// POST /api/v1/post - Create new post (with Lexical JSON, categoryIds, tags)
app.post("/", authMiddleware, upload.array('photos'), uploadToCloudinary('photos'), createPost);

// PUT /api/v1/post/:id - Update post
app.put("/:id", authMiddleware, updatePost);

// GET /api/v1/post/user - Get current user's posts (REQUIRES AUTH)
app.get("/user", authMiddleware, getUserPosts);

// GET /api/v1/post/user/:userId - Get posts by any user ID (PUBLIC with optional personalization)
app.get("/user/:userId", optionalAuthMiddleware, getPostsByUserId);

// GET /api/v1/post - Get all posts feed (PUBLIC with optional personalization)
app.get("/", optionalAuthMiddleware, getAllPosts);

// GET /api/v1/post/:id - Get single post (MUST BE LAST!)
app.get("/:id", getPostById);

export default app;