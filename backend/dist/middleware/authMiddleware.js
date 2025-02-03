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
exports.authMiddleware = void 0;
const asyncHandler_1 = require("./asyncHandler");
const customError_1 = __importDefault(require("../utils/customError"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.authMiddleware = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1];
    if (!token) {
        throw new customError_1.default("Invalid User / User not logged in", 400);
    }
    if (!process.env.JWT_SECRET) {
        throw new customError_1.default("JWT key is not defined", 400);
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET); // Another way is to create a custom payload.
    if (!decoded) {
        throw new customError_1.default("Unable to verify user", 400);
    }
    req.id = decoded.id;
    next();
}));
