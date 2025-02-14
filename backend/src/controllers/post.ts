import { Response, Request } from 'express'
import { PrismaClient } from '@prisma/client'
import { asyncHandler } from '../middleware/asyncHandler'
import CustomError from '../utils/customError'
import { PostBody } from '../types/types'

const prisma = new PrismaClient()

interface AuthRequest extends Request{
    id?: string
}


// Create Post
export const createPost = asyncHandler(async (req: AuthRequest, res: Response) => {

    const { success } = PostBody.safeParse(req.body)
    if (!success) {
        throw new CustomError("Invalid data input", 400)
    }

    const userId = req.id
    const { title, content } = req.body;
    const post = await prisma.post.create({
        data: {
            title,
            description: content,
            user: {
                connect: {
                    id: userId
                }
            }
        }
    })

    return res.status(201).json({
        message: "Post successfully created",
        post
    })
})

// Update Post
export const updatePost = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { success, data } = PostBody.safeParse(req.body)
    if (!success) {
        throw new CustomError("Invalid data input", 400)
    }

    const postId = req.params.id
    const { title, content } = req.body

    const post = await prisma.post.update({
        where: { id: postId },
        data: { 
            title, 
            description: content 
        }
    })

    return res.status(200).json({
        message: "Post successfully updated",
        post
    })
})

// Delete Post
export const deletePost = asyncHandler(async (req: AuthRequest, res: Response) => {
    const postId = req.params.id

    await prisma.post.delete({
        where: { id: postId }
    })

    return res.status(200).json({
        message: "Post successfully deleted"
    })
})

//Get User Post
export const getUserPosts = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.id;
    console.log(userId);
    const posts = await prisma.post.findMany({
        where: { userId: userId },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true
                }
            }
        }
    });

    if (!posts) {
        throw new CustomError("Post not found", 404);
    }

    return res.status(200).json({
        message: "Posts retrieved successfully",
        posts
    });
});



// Get All Posts
export const getAllPosts = asyncHandler(async (req, res: Response) => {
    const posts = await prisma.post.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true
                }
            }
        }
    })

    return res.status(200).json({
        message: "All posts retrieved successfully",
        posts
    })
})


// Get Post By ID
export const getPostById = asyncHandler(async (req, res: Response) => {
    const postId = req.params.id
    const post = await prisma.post.findUnique({
        where: { id: postId }
    })

    if (!post) {
        throw new CustomError("Post not found", 404)
    }

    return res.status(200).json({
        message: "Post retrieved successfully",
        post
    })
})
