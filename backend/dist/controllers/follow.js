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
exports.getNativeFollowing = exports.getFollowing = exports.getNativeFollowers = exports.getFollowers = exports.getStatus = exports.unfollowUser = exports.followUser = void 0;
const asyncHandler_1 = require("../middleware/asyncHandler");
const client_1 = require("@prisma/client");
const customError_1 = __importDefault(require("../utils/customError"));
const prisma = new client_1.PrismaClient();
exports.followUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.id;
    const tofollow = req.query.id;
    const follow = yield prisma.follow.create({
        data: {
            followerId: userId,
            followingId: tofollow
        }
    });
    if (!follow) {
        throw new customError_1.default("User already follwed", 400);
    }
    return res.status(200).json({
        message: "Follower Updated"
    });
}));
exports.unfollowUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.id;
    const tounfollow = req.query.id;
    yield prisma.follow.delete({
        where: {
            followerId_followingId: {
                followerId: userId,
                followingId: tounfollow
            }
        }
    });
    return res.status(200).json({
        message: "User successfully unfollwed"
    });
}));
exports.getStatus = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.id;
    const tocheckId = req.query.id;
    const isFollowing = yield prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: userId,
                followingId: tocheckId
            }
        }
    });
    return res.json({
        following: Boolean(isFollowing)
    });
}));
exports.getFollowers = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.id;
    const followers = yield prisma.follow.findMany({
        where: {
            followingId: userId,
        },
        include: {
            follower: {
                select: {
                    id: true,
                    firstName: true,
                },
            },
        },
    });
    return res.status(200).json({
        followers: followers.map((follow) => follow.follower),
        count: followers.length,
    });
}));
exports.getNativeFollowers = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.query.id;
    const followers = yield prisma.follow.findMany({
        where: {
            followingId: userId,
        }
    });
    return res.status(200).json({
        followers,
        count: followers.length
    });
}));
exports.getFollowing = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.id;
    const followingUsers = yield prisma.follow.findMany({
        where: {
            followerId: userId,
        },
        include: {
            following: {
                select: {
                    id: true,
                    firstName: true,
                },
            },
        },
    });
    return res.status(200).json({
        following: followingUsers.map((follow) => follow.following),
        count: followingUsers.length,
    });
}));
exports.getNativeFollowing = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.query.id;
    const followingUsers = yield prisma.follow.findMany({
        where: {
            followerId: userId,
        }
    });
    return res.status(200).json({
        followingUsers,
        count: followingUsers.length
    });
}));
