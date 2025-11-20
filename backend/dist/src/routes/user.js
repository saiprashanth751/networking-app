"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controllers/user");
const authMiddleware_1 = require("../middleware/authMiddleware");
const fileMiddleware_1 = __importStar(require("../middleware/fileMiddleware"));
const app = express_1.default.Router();
app.post("/signup", user_1.userSignup);
app.post("/signin", user_1.userSignin);
app.get("/", authMiddleware_1.authMiddleware, user_1.getUser);
app.get("/userProfile", authMiddleware_1.authMiddleware, user_1.getUserProfile);
app.get("/bulk", authMiddleware_1.authMiddleware, user_1.getUsers);
app.post("/profile", authMiddleware_1.authMiddleware, fileMiddleware_1.default.single('profilePic'), (0, fileMiddleware_1.uploadToCloudinary)('profilePic'), user_1.createProfile);
app.put("/profile", authMiddleware_1.authMiddleware, fileMiddleware_1.default.single('profilePic'), (0, fileMiddleware_1.uploadToCloudinary)('profilePic'), user_1.updateProfile);
app.get("/profile", authMiddleware_1.authMiddleware, user_1.getProfile);
app.get("/nativeProfile", authMiddleware_1.authMiddleware, user_1.getNative);
app.get("/status/:id", authMiddleware_1.authMiddleware, user_1.getOnlineStatus);
app.get("/search", authMiddleware_1.authMiddleware, user_1.getUserByName);
exports.default = app;
