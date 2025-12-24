import { Response, Request } from 'express';
import prisma from '../../prisma/prisma_client';
import { asyncHandler } from '../middleware/asyncHandler';
import CustomError from '../utils/customError';

interface AuthRequest extends Request {
    id?: string;
}

// Get all active categories
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            icon: true,
            color: true,
            postsCount: true,
        },
    });

    return res.status(200).json({
        message: 'Categories retrieved successfully',
        categories,
    });
});

// Get single category by slug
export const getCategoryBySlug = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
        where: { slug },
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            icon: true,
            color: true,
            postsCount: true,
        },
    });

    if (!category) {
        throw new CustomError('Category not found', 404);
    }

    return res.status(200).json({
        message: 'Category retrieved successfully',
        category,
    });
});

// Get posts by category slug with pagination
export const getPostsByCategory = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Verify category exists
    const category = await prisma.category.findUnique({
        where: { slug },
    });

    if (!category) {
        throw new CustomError('Category not found', 404);
    }

    // Get posts in this category
    const posts = await prisma.post.findMany({
        where: {
            isDraft: false,
            categories: {
                some: {
                    categoryId: category.id,
                },
            },
        },
        skip: offset,
        take: Number(limit),
        orderBy: { publishedAt: 'desc' },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profile: {
                        select: {
                            profilePic: true,
                        },
                    },
                },
            },
            categories: {
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            icon: true,
                            color: true,
                        },
                    },
                },
            },
            tags: {
                include: {
                    tag: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            },
            media: {
                orderBy: { order: 'asc' },
            },
            _count: {
                select: {
                    likes: true,
                    comments: true,
                    bookmarks: true,
                    shares: true,
                },
            },
        },
    });

    // Get total count for pagination
    const totalPosts = await prisma.post.count({
        where: {
            isDraft: false,
            categories: {
                some: {
                    categoryId: category.id,
                },
            },
        },
    });

    return res.status(200).json({
        message: 'Posts retrieved successfully',
        posts,
        category,
        pagination: {
            total: totalPosts,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(totalPosts / Number(limit)),
        },
    });
});
