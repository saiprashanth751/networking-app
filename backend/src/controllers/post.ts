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
    
    const { title, description, labels, links } = req.body;


    let photoPaths: string[] = [];
    if (req.files && Array.isArray(req.files)) {
        photoPaths = req.files.map((file: any) => file.cloudinaryUrl); 
    }

   
    const parsedLabels = labels ? JSON.parse(labels) : [];
    const parsedLinks = links ? JSON.parse(links) : [];

  
    const validation = PostBody.safeParse({
        title,
        description,
        labels: parsedLabels,
        links: parsedLinks,
        photos: photoPaths,
    });

    if (!validation.success) {
        throw new CustomError("Invalid data input", 400);
    }

    // Create the post
    try {
        const post = await prisma.post.create({
            data: {
                title,
                description,
                labels: parsedLabels,
                links: parsedLinks,
                photos: photoPaths,
                user: {
                    connect: {
                        id: req.id,
                    },
                },
            },
        });

        return res.status(201).json({
            message: "Post successfully created",
            post,
        });
    } catch (error) {
        console.error("Failed to create post:", error);
        throw new CustomError("Failed to create post", 500);
    }
});

// Update Post
export const updatePost = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { success } = PostBody.safeParse(req.body);
    if (!success) {
        throw new CustomError("Invalid data input", 400);
    }

    const postId = req.params.id;
    const userId = req.id;
    const { title, content, labels, links } = req.body;

    // Check if the post belongs to the user
    const existingPost = await prisma.post.findUnique({
        where: { id: postId },
    });

    if (!existingPost || existingPost.userId !== userId) {
        throw new CustomError("You are not authorized to update this post", 403);
    }

    const post = await prisma.post.update({
        where: { id: postId },
        data: { 
            title, 
            description: content,
            labels: labels ? JSON.parse(labels) : existingPost.labels,
            links: links ? JSON.parse(links) : existingPost.links,
        },
    });

    return res.status(200).json({
        message: "Post successfully updated",
        post,
    });
});

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
    
    const posts = await prisma.post.findMany({
        where: { userId: userId },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    profile: { 
                        select: {
                            profilePic: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        },
    });

    if (!posts.length) {
        return res.status(200).json({
            message: "No posts found",
            posts: []
        });
    }

    // Flatten the profile picture into the user object
    // const formattedPosts = posts.map(post => ({
    //     ...post,
    //     user: {
    //         firstName: post.user.firstName,
    //         lastName: post.user.lastName,
    //         profilePic: post.user.profile?.profilePic || null
    //     }
    // }));

    return res.status(200).json({
        message: "Posts retrieved successfully",
        posts
    });
});


// Get All Posts
export const getAllPosts = asyncHandler(async (req, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const posts = await prisma.post.findMany({
        skip: offset,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profile: { 
                        select: {
                            profilePic: true
                        }
                    }
                }
            }
        }
    });

    const totalPosts = await prisma.post.count();

    // Format the posts to flatten profile data
    // const formattedPosts = posts.map(post => ({
    //     ...post,
    //     user: {
    //         firstName: post.user.firstName,
    //         lastName: post.user.lastName,
    //         profilePic: post.user.profile?.profilePic || null
    //     }
    // }));

    return res.status(200).json({
        message: "All posts retrieved successfully",
        posts,
        totalPosts,
        totalPages: Math.ceil(totalPosts / Number(limit)),
        currentPage: Number(page)
    });
});


// Get Post By ID
export const getPostById = asyncHandler(async (req, res: Response) => {
    const id = req.params.id;
    const posts = await prisma.post.findMany({
        where: { userId: id },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    profile: {
                        select: {
                            profilePic:true
                        }
                    },
                    posts: {
                        select: {
                            photos: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: "desc",
        },
        
    });

    if (posts.length === 0) {
        throw new CustomError("No posts found for this user", 404);
    }

    return res.status(200).json({
        message: "Posts retrieved successfully",
        posts
    });
});

