import { asyncHandler } from "../middleware/asyncHandler";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import CustomError from "../utils/customError";

const prisma = new PrismaClient()

interface AuthRequest extends Request{
    id?: string
}

export const followUser = asyncHandler(async (req:AuthRequest, res: Response) => {
    const userId = req.id as string
    const tofollow = req.params.id;

    const follow = await prisma.follow.create({
        data:{
            followerId: userId,
            followingId: tofollow
        }
    })

    if(!follow){
        throw new CustomError("User already follwed", 400)
    }

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
    
    return res.status(200).json({
        message: "User successfully unfollwed"
    })
})

export const getFollowers = asyncHandler(async (req: AuthRequest, res:Response) => {
    const userId = req.id as string
    const followers = await prisma.follow.findMany({
        where:{
            followingId: userId,
        }
    })

    if(!followers){
        throw new CustomError("No followers", 400)
    }

    return res.status(200).json({
        followers
    })
})

export const getFollowing = asyncHandler(async(req:AuthRequest, res:Response) => {
    const userId = req.id as string
    const followingUsers = await prisma.follow.findMany({
        where: {
            followerId: userId,
        }
    })
    if(!followingUsers){
        throw new CustomError("User is not following anyone", 400)
    }
    
    return res.status(200).json({
        followingUsers
    })

})


