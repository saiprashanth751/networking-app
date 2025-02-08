import { asyncHandler } from "../middleware/asyncHandler";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

interface AuthRequest extends Request{
    id?: string
}

export const verifyEmail = asyncHandler( async (req: AuthRequest, res: Response) => {
    const token = req.params.token;
    if(!token){
        return res.status(400).json({
            message: "Invalid token"
        })
    }
    console.log(token)
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as unknown as { id: string }

    if(!decoded){
        return res.status(400).json({
            message: "Invalid token"
        })
    }


    await prisma.user.update({
        where: {
            id: decoded.id
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