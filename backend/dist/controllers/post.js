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
exports.getPostById = exports.getAllPosts = exports.getUserPosts = exports.deletePost = exports.updatePost = exports.createPost = void 0;
const client_1 = require("@prisma/client");
const asyncHandler_1 = require("../middleware/asyncHandler");
const customError_1 = __importDefault(require("../utils/customError"));
const types_1 = require("../types/types");
const prisma = new client_1.PrismaClient();
// Create Post
exports.createPost = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, labels, links } = req.body;
    let photoPaths = [];
    if (req.files && Array.isArray(req.files)) {
        photoPaths = req.files.map((file) => file.path);
    }
    const parsedLabels = labels ? JSON.parse(labels) : [];
    const parsedLinks = links ? JSON.parse(links) : [];
    const validation = types_1.PostBody.safeParse({
        title,
        description,
        labels: parsedLabels,
        links: parsedLinks,
        photos: photoPaths,
    });
    if (!validation.success) {
        throw new customError_1.default("Invalid data input", 400);
    }
    // Create the post
    try {
        const post = yield prisma.post.create({
            data: {
                title,
                description,
                labels: parsedLabels,
                links: parsedLinks,
                photos: photoPaths,
                user: {
                    connect: {
                        id: req.id,
                    },
                },
            },
        });
        return res.status(201).json({
            message: "Post successfully created",
            post,
        });
    }
    catch (error) {
        console.error("Failed to create post:", error);
        throw new customError_1.default("Failed to create post", 500);
    }
}));
// Update Post
exports.updatePost = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { success } = types_1.PostBody.safeParse(req.body);
    if (!success) {
        throw new customError_1.default("Invalid data input", 400);
    }
    const postId = req.params.id;
    const userId = req.id;
    const { title, content, labels, links } = req.body;
    // Check if the post belongs to the user
    const existingPost = yield prisma.post.findUnique({
        where: { id: postId },
    });
    if (!existingPost || existingPost.userId !== userId) {
        throw new customError_1.default("You are not authorized to update this post", 403);
    }
    const post = yield prisma.post.update({
        where: { id: postId },
        data: {
            title,
            description: content,
            labels: labels ? JSON.parse(labels) : existingPost.labels,
            links: links ? JSON.parse(links) : existingPost.links,
        },
    });
    return res.status(200).json({
        message: "Post successfully updated",
        post,
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
//Get User Post
exports.getUserPosts = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.id;
    const posts = yield prisma.post.findMany({
        where: { userId: userId },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    profile: {
                        select: {
                            profilePic: true
                        }
                    }
                }
            }
        }
    });
    if (!posts.length) {
        return res.status(200).json({
            message: "No posts found",
            posts: []
        });
    }
    // Flatten the profile picture into the user object
    // const formattedPosts = posts.map(post => ({
    //     ...post,
    //     user: {
    //         firstName: post.user.firstName,
    //         lastName: post.user.lastName,
    //         profilePic: post.user.profile?.profilePic || null
    //     }
    // }));
    return res.status(200).json({
        message: "Posts retrieved successfully",
        posts
    });
}));
// Get All Posts
exports.getAllPosts = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const posts = yield prisma.post.findMany({
        skip: offset,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    profile: {
                        select: {
                            profilePic: true
                        }
                    }
                }
            }
        }
    });
    const totalPosts = yield prisma.post.count();
    // Format the posts to flatten profile data
    // const formattedPosts = posts.map(post => ({
    //     ...post,
    //     user: {
    //         firstName: post.user.firstName,
    //         lastName: post.user.lastName,
    //         profilePic: post.user.profile?.profilePic || null
    //     }
    // }));
    return res.status(200).json({
        message: "All posts retrieved successfully",
        posts,
        totalPosts,
        totalPages: Math.ceil(totalPosts / Number(limit)),
        currentPage: Number(page)
    });
}));
// Get Post By ID
exports.getPostById = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const posts = yield prisma.post.findMany({
        where: { userId: id },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    profile: {
                        select: {
                            profilePic: true
                        }
                    },
                    posts: {
                        select: {
                            photos: true
                        }
                    }
                }
            }
        },
    });
    if (posts.length === 0) {
        throw new customError_1.default("No posts found for this user", 404);
    }
    return res.status(200).json({
        message: "Posts retrieved successfully",
        posts
    });
}));
