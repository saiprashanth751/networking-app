import  express  from "express";
import { createPost, getAllPosts, getPostById, getUserPosts, updatePost } from "../controllers/post";
import { authMiddleware } from "../middleware/authMiddleware";

const app = express.Router();

app.post("/userPost",authMiddleware, createPost);
app.put("/updatePost",updatePost);
app.get("/userAll",authMiddleware, getUserPosts);
app.get("/all",getAllPosts);
app.get("/:id",getPostById);

export default app;