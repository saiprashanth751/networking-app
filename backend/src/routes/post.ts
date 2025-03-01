import  express  from "express";
import { createPost, getAllPosts, getPostById, getUserPosts, updatePost } from "../controllers/post";
import { authMiddleware } from "../middleware/authMiddleware";
import upload, { uploadToCloudinary } from '../middleware/fileMiddleware'

const app = express.Router();

app.post("/create",authMiddleware,upload.array('photos'),uploadToCloudinary('photos') ,createPost);
app.put("/update",updatePost);
app.get("/userAll",authMiddleware, getUserPosts);
app.get("/all",getAllPosts);
app.get("/:id",getPostById);

export default app;