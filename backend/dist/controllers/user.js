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
exports.userSignin = exports.userSignup = void 0;
const client_1 = require("@prisma/client");
const asyncHandler_1 = require("../middleware/asyncHandler");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const customError_1 = __importDefault(require("../utils/customError"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const types_1 = require("../types/types");
const prisma = new client_1.PrismaClient();
exports.userSignup = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { success } = types_1.signupBody.safeParse(req.body);
    if (!success) {
        throw new customError_1.default("Invalid input", 403);
    }
    const { firstName, lastName, email, password } = req.body;
    const existingUser = yield prisma.user.findUnique({
        where: {
            email
        }
    });
    if (existingUser) {
        throw new customError_1.default("User already exists", 409);
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const user = yield prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            password: hashedPassword
        }
    });
    if (!process.env.JWT_SECRET) {
        throw new customError_1.default("JWT_SECRET is not defined", 500);
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET);
    return res.status(200).json({
        message: "User created successfully",
        token
    });
}));
exports.userSignin = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { success } = types_1.signinBody.safeParse(req.body);
    if (!success) {
        throw new customError_1.default("Invalid input", 403);
    }
    const { email, password } = req.body;
    const user = yield prisma.user.findUnique({
        where: {
            email
        }
    });
    if (!user) {
        throw new customError_1.default("User does not exist", 400);
    }
    const passwordVerification = yield bcrypt_1.default.compare(password, user.password);
    if (!passwordVerification) {
        throw new customError_1.default("Incorrect Password", 400);
    }
    if (!process.env.JWT_SECRET) {
        throw new customError_1.default("JWT_SECRET is not defined", 500);
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET);
    return res.status(200).json({
        message: "Sign in successfull",
        token
    });
}));
