import { asyncHandler } from "../middleware/asyncHandler";
import { Request, Response } from "express";
import prisma from "../../prisma/prisma_client";
import jwt from "jsonwebtoken"


interface AuthRequest extends Request{
    id?: string
}

export const verifyEmail = asyncHandler(async (req: AuthRequest, res: Response) => {
    const token = req.params.token;
    
    if (!token) {
        return res.status(400).json({
            message: "Invalid token"
        });
    }

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };

        await prisma.user.update({
            where: { id: decoded.id },
            data: { verified: true }
        });
        
        return res.redirect(`${process.env.ORIGIN_URL}/signin`);

        // return res.status(200).json({
        //     message: "Email verified successfully"
        // });
        
    } catch (error) {
        console.error("Token verification error:", error);
        return res.redirect(`${process.env.ORIGIN_URL}/signin?error=verification_failed`);
    }
});