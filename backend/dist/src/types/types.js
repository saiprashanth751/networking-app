"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBody = exports.PostBody = exports.profileUpdation = exports.profileCreation = exports.signinBody = exports.signupBody = void 0;
const zod_1 = __importDefault(require("zod"));
exports.signupBody = zod_1.default.object({
    firstName: zod_1.default.string(),
    lastName: zod_1.default.string(),
    email: zod_1.default.string(),
    password: zod_1.default.string().min(8).max(20)
});
exports.signinBody = zod_1.default.object({
    email: zod_1.default.string(),
    password: zod_1.default.string().min(8).max(20)
});
exports.profileCreation = zod_1.default.object({
    bio: zod_1.default.string().optional(),
    profilePic: zod_1.default.string().optional(),
    graduationYear: zod_1.default.string().optional(),
    department: zod_1.default.string(),
    minor: zod_1.default.string(),
    linkedin: zod_1.default.string().optional(),
    github: zod_1.default.string().optional(),
    leetcode: zod_1.default.string().optional(),
    codeforces: zod_1.default.string().optional(),
    geekforgeeks: zod_1.default.string().optional()
});
exports.profileUpdation = zod_1.default.object({
    bio: zod_1.default.string().optional(),
    profilePic: zod_1.default.string().optional(),
    linkedin: zod_1.default.string().optional(),
    github: zod_1.default.string().optional(),
    leetcode: zod_1.default.string().optional(),
    codeforces: zod_1.default.string().optional(),
    geekforgeeks: zod_1.default.string().optional()
});
exports.PostBody = zod_1.default.object({
    title: zod_1.default.string(),
    description: zod_1.default.string(),
    labels: zod_1.default.array(zod_1.default.string()),
    photos: zod_1.default.array(zod_1.default.string()).optional(),
    links: zod_1.default.array(zod_1.default.string()).optional(),
});
exports.MessageBody = zod_1.default.object({
    senderId: zod_1.default.string(),
    receiverId: zod_1.default.string(),
    content: zod_1.default.string()
});
