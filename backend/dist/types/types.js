"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signinBody = exports.signupBody = void 0;
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
