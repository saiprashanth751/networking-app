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
    const tofollow = req.query.id as string;
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
    const tounfollow =  req.query.id as string
    
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

export const getStatus = asyncHandler(async (req:AuthRequest, res: Response) => {
    const userId = req.id as string
    const tocheckId = req.query.id as string

    const isFollowing = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: userId,
                followingId: tocheckId
            }
        }
    })
    return res.json({
        following: Boolean(isFollowing)
    })
})

export const getFollowers = asyncHandler(async (req: AuthRequest, res:Response) => {
    const userId = req.id as string
    const followers = await prisma.follow.findMany({
        where:{
            followingId: userId,
        }
    })


    return res.status(200).json({
        followers,
        count: followers.length
    })
})

export const getNativeFollowers = asyncHandler(async (req: AuthRequest, res:Response) => {
    const userId = req.query.id as string
    const followers = await prisma.follow.findMany({
        where:{
            followingId: userId,
        }
    })


    return res.status(200).json({
        followers,
        count: followers.length
    })
})

export const getFollowing = asyncHandler(async(req:AuthRequest, res:Response) => {
    const userId = req.id as string
    const followingUsers = await prisma.follow.findMany({
        where: {
            followerId: userId,
        }
    })
    
    return res.status(200).json({
        followingUsers,
        count: followingUsers.length
    })

})

export const getNativeFollowing = asyncHandler(async(req:AuthRequest, res:Response) => {
    const userId = req.query.id as string
    const followingUsers = await prisma.follow.findMany({
        where: {
            followerId: userId,
        }
    })
    
    return res.status(200).json({
        followingUsers,
        count: followingUsers.length
    })

})


