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
exports.markMessagesAsRead = exports.getMessages = exports.sendMessage = void 0;
const asyncHandler_1 = require("../middleware/asyncHandler");
const types_1 = require("../types/types");
const customError_1 = __importDefault(require("../utils/customError"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.sendMessage = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { success } = types_1.MessageBody.safeParse(req.body);
    if (!success) {
        new customError_1.default("Invalid input", 400);
    }
    const id = req.id;
    if (!id) {
        throw new customError_1.default("User ID is missing", 400);
    }
    const { receiverId, content } = req.body;
    const msg = yield prisma.message.create({
        data: {
            senderId: id,
            receiverId,
            content
        }
    });
    return res.status(200).json({
        mes: "Message Sent",
        msg
    });
}));
exports.getMessages = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.id;
    const receiverId = req.params.id;
    if (!id) {
        throw new customError_1.default("User ID is missing", 400);
    }
    const messages = yield prisma.message.findMany({
        where: {
            OR: [
                { senderId: id, receiverId },
                { senderId: receiverId, receiverId: id }
            ]
        },
        orderBy: {
            timestamp: "asc"
        }
    });
    return res.status(200).json({
        messages
    });
}));
exports.markMessagesAsRead = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.id;
    const senderId = req.params.id;
    yield prisma.message.updateMany({
        where: {
            senderId,
            receiverId: id,
            read: false
        },
        data: {
            read: true
        }
    });
    res.status(200).json({
        messages: "Messages marked as read"
    });
}));
