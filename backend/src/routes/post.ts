import  express  from "express";
import { createPost, getAllPosts, getPostById, getUserPosts, updatePost } from "../controllers/post";

const app = express.Router();

app.post("/userPost",createPost);
app.put("/updatePost",updatePost);
app.get("/userAll",getUserPosts);
app.get("/all",getAllPosts);
app.get("/:id",getPostById);

export default app;