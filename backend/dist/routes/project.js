"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const project_1 = require("../controllers/project");
const authMiddleware_1 = require("../middleware/authMiddleware");
const app = express_1.default.Router();
app.post("/new", authMiddleware_1.authMiddleware, project_1.createProject);
app.put("/update", authMiddleware_1.authMiddleware, project_1.updateProject);
app.get("/all", authMiddleware_1.authMiddleware, project_1.getProjects);
app.delete("/project", authMiddleware_1.authMiddleware, project_1.deleteProject); //You may use query/params for this route
exports.default = app;
