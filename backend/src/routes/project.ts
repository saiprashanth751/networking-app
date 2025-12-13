import express from "express";
import { 
  createProject, 
  getAllProjects, 
  getProjectById, 
  getUserProjects, 
  updateProject, 
  deleteProject,
  toggleFeaturedProject
} from "../controllers/project";
import { authMiddleware } from "../middleware/authMiddleware";
import upload, { uploadToCloudinary } from '../middleware/fileMiddleware';

const app = express.Router();

app.post("/create", authMiddleware, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'images', maxCount: 6 }
]), uploadToCloudinary('coverImage', 'images'), createProject);

app.put("/update/:id", authMiddleware, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'images', maxCount: 6 }
]), uploadToCloudinary('coverImage', 'images'), updateProject);

app.delete("/:id", authMiddleware, deleteProject);
app.put("/featured/:id", authMiddleware, toggleFeaturedProject);
app.get("/user/:userId", getUserProjects);
app.get("/userAll", authMiddleware, getUserProjects);
app.get("/all", getAllProjects);
app.get("/:id", getProjectById);

export default app;