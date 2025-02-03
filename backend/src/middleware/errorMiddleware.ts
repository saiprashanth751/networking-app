import { Request, Response, NextFunction } from "express";
import CustomError from "../utils/customError";
// Custom error handler middleware
export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction): void => {
    // Logging the error (you can customize this)
    console.error("Error occurred:", err.message);

    // If the error is an instance of a custom error, handle it specifically
    if (err instanceof CustomError) {
        res.status(err.status).json({ message: err.message });
    }

    // Default case for unexpected errors
    res.status(500).json({
        message: "Internal Server Error",
    });
};
