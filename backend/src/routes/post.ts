import  express  from "express";
import { createPost, getAllPosts, getPostById, updatePost } from "../controllers/post";

const app = express.Router();

app.post("/post",createPost);
app.put("/post",updatePost);
app.get("/all",getAllPosts);
app.get("/:id",getPostById);

export default app;