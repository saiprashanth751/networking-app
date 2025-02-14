"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostById = exports.getAllPosts = exports.deletePost = exports.updatePost = exports.createPost = void 0;
const client_1 = require("@prisma/client");
const asyncHandler_1 = require("../middleware/asyncHandler");
const customError_1 = __importDefault(require("../utils/customError"));
const types_1 = require("../types/types");
const prisma = new client_1.PrismaClient();
// Create Post
exports.createPost = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { success } = types_1.PostBody.safeParse(req.body);
    if (!success) {
        throw new customError_1.default("Invalid data input", 400);
    }
    const userId = req.id;
    const { title, content } = req.body;
    const post = yield prisma.post.create({
        data: {
            title,
            description: content,
            user: {
                connect: {
                    id: userId
                }
            }
        }
    });
    return res.status(201).json({
        message: "Post successfully created",
        post
    });
}));
// Update Post
exports.updatePost = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { success, data } = types_1.PostBody.safeParse(req.body);
    if (!success) {
        throw new customError_1.default("Invalid data input", 400);
    }
    const postId = req.params.id;
    const { title, content } = req.body;
    const post = yield prisma.post.update({
        where: { id: postId },
        data: {
            title,
            description: content
        }
    });
    return res.status(200).json({
        message: "Post successfully updated",
        post
    });
}));
// Delete Post
exports.deletePost = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.id;
    yield prisma.post.delete({
        where: { id: postId }
    });
    return res.status(200).json({
        message: "Post successfully deleted"
    });
}));
// Get All Posts
exports.getAllPosts = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield prisma.post.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    });
    return res.status(200).json({
        message: "All posts retrieved successfully",
        posts
    });
}));
// Get Post By ID
exports.getPostById = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.id;
    const post = yield prisma.post.findUnique({
        where: { id: postId }
    });
    if (!post) {
        throw new customError_1.default("Post not found", 404);
    }
    return res.status(200).json({
        message: "Post retrieved successfully",
        post
    });
}));
