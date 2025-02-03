"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const customError_1 = __importDefault(require("../utils/customError"));
// Custom error handler middleware
const errorMiddleware = (err, req, res, next) => {
    // Logging the error (you can customize this)
    console.error("Error occurred:", err.message);
    // If the error is an instance of a custom error, handle it specifically
    if (err instanceof customError_1.default) {
        res.status(err.status).json({ message: err.message });
    }
    // Default case for unexpected errors
    res.status(500).json({
        message: "Internal Server Error",
    });
};
exports.errorMiddleware = errorMiddleware;
