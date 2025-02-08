"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const auth_1 = require("../controllers/auth");
const app = express_1.default.Router();
app.get("/verify/:id", authMiddleware_1.authMiddleware, auth_1.verifyEmail);
exports.default = app;
