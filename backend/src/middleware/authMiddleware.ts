import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "./asyncHandler";
import CustomError from "../utils/customError";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
    id?: String
}

export const authMiddleware = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
        throw new CustomError("Invalid User / User not logged in", 400)
    }
    if (!process.env.JWT_SECRET) {
        throw new CustomError("JWT key is not defined", 400)
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string } // Another way is to create a custom payload.
    if (!decoded) {
        throw new CustomError("Unable to verify user", 400)
    }
    req.id = decoded.id
    next()
})

/**
 * Optional Authentication Middleware
 * 
 * For public routes that should work for both authenticated and unauthenticated users.
 * If valid token exists: sets req.id (user gets personalized data)
 * If no token/invalid token: continues without req.id (user gets public data)
 * 
 * Use cases:
 * - Public feed (GET /post) - everyone can view, logged-in users see their like status
 * - Public profiles (GET /post/user/:userId) - everyone can view, logged-in users see interaction status
 */
export const optionalAuthMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    // No token - continue as unauthenticated user
    if (!token) {
        return next();
    }

    // No JWT secret configured - continue as unauthenticated
    if (!process.env.JWT_SECRET) {
        return next();
    }

    // Try to verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
        if (decoded && decoded.id) {
            req.id = decoded.id;
        }
    } catch (error) {
        // Invalid/expired token - continue as unauthenticated user
        // Don't throw error for optional auth
    }

    next();
}