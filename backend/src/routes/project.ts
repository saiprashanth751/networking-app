import express from "express"
import { createProject, deleteProject, getProjects, updateProject } from "../controllers/project"
import { authMiddleware } from "../middleware/authMiddleware"

const app = express.Router()

app.post("/new",authMiddleware ,createProject)
app.put("/update",authMiddleware ,updateProject)
app.get("/all",authMiddleware ,getProjects)
app.delete("/project", authMiddleware, deleteProject)

export default app
