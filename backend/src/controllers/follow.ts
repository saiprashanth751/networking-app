import { asyncHandler } from "../middleware/asyncHandler";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

interface AuthRequest extends Request{
    id?: string
}

export const followUser = asyncHandler(async (req:AuthRequest, res: Response) => {
    const userId = req.id as string
    const tofollow = req.params.id;

    await prisma.follow.create({
        data:{
            followerId: userId,
            followingId: tofollow
        }
    })

    return res.status(200).json({
        message: "Follower Updated"
    })
})

export const unfollowUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.id as string
    const tounfollow =  req.params.id
    
    await prisma.follow.delete({
        where: {
            followerId_followingId: {
                followerId: userId,
                followingId: tounfollow
            }
        }
    })
})