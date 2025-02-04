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
exports.deleteProject = exports.getProjects = exports.updateProject = exports.createProject = void 0;
const asyncHandler_1 = require("../middleware/asyncHandler");
const types_1 = require("../types/types");
const customError_1 = __importDefault(require("../utils/customError"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.createProject = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { success } = types_1.ProjectBody.safeParse(req.body);
    if (!success) {
        throw new customError_1.default("Invalid data input", 400);
    }
    const userId = req.id;
    const { title, description } = req.body;
    const project = yield prisma.project.create({
        data: {
            title,
            description,
            user: {
                connect: {
                    id: userId
                }
            }
        }
    });
    return res.status(200).json({
        message: "Project successfully created",
        project
    });
}));
exports.updateProject = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { success } = types_1.ProjectBody.safeParse(req.body);
    if (!success) {
        throw new customError_1.default("Invalid data input", 400);
    }
    const userId = req.id;
    const { title, description } = req.body;
    const project = yield prisma.project.update({
        where: {
            userId
        },
        data: {
            title,
            description,
        }
    });
    return res.status(200).json({
        message: "Project updated successfully",
        project
    });
}));
exports.getProjects = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.id;
    const projects = yield prisma.project.findMany({
        where: {
            userId
        }
    });
    return res.status(200).json({
        projects
    });
}));
exports.deleteProject = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.id;
    const userId = req.id;
    yield prisma.project.delete({
        where: {
            id,
            userId
        }
    });
    return res.status(200).json({
        message: "Project successfully deleted"
    });
}));
