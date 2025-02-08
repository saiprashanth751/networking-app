import { asyncHandler } from "../middleware/asyncHandler";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

interface AuthRequest extends Request{
    id?: string
}

export const verifyEmail = asyncHandler( async (req: AuthRequest, res: Response) => {
    const id = req.id

    await prisma.user.update({
        where: {
            id
        },
        data: {
            verified: true
        }
        
    }) 
    res.redirect("http://localhost:5173/signin")
    
    return res.status(200).json({
        message: "You are successfully verified. You can log in..."
    })

})