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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = void 0;
const asyncHandler_1 = require("../middleware/asyncHandler");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.verifyEmail = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.id;
    yield prisma.user.update({
        where: {
            id
        },
        data: {
            verified: true
        }
    });
    res.redirect("http://localhost:5173/signin");
    return res.status(200).json({
        message: "You are successfully verified. You can log in..."
    });
}));
