"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controllers/user");
const authMiddleware_1 = require("../middleware/authMiddleware");
const app = express_1.default.Router();
app.post("/signup", user_1.userSignup);
app.post("/signin", user_1.userSignin);
app.get("/", authMiddleware_1.authMiddleware, user_1.getUser);
app.get("/userProfile", authMiddleware_1.authMiddleware, user_1.getUserProfile);
app.get("/bulk", authMiddleware_1.authMiddleware, user_1.getUsers);
app.post("/profile", authMiddleware_1.authMiddleware, user_1.createProfile);
app.put("/profile", authMiddleware_1.authMiddleware, user_1.updateProfile);
app.get("/profile", authMiddleware_1.authMiddleware, user_1.getProfile);
app.get("/nativeProfile", authMiddleware_1.authMiddleware, user_1.getNative);
exports.default = app;
