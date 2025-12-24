import { Response, Request } from 'express';
import prisma from '../../prisma/prisma_client';
import { asyncHandler } from '../middleware/asyncHandler';
import CustomError from '../utils/customError';

// Search tags for autocomplete
export const searchTags = asyncHandler(async (req: Request, res: Response) => {
    const { q = '', limit = 10 } = req.query;

    const tags = await prisma.tag.findMany({
        where: {
            name: {
                contains: q as string,
                mode: 'insensitive',
            },
        },
        take: Number(limit),
        orderBy: { usageCount: 'desc' },
        select: {
            id: true,
            name: true,
            slug: true,
            usageCount: true,
        },
    });

    return res.status(200).json({
        message: 'Tags retrieved successfully',
        tags,
    });
});

// Get trending tags
export const getTrendingTags = asyncHandler(async (req: Request, res: Response) => {
    const { limit = 10 } = req.query;

    const tags = await prisma.tag.findMany({
        take: Number(limit),
        orderBy: { usageCount: 'desc' },
        select: {
            id: true,
            name: true,
            slug: true,
            usageCount: true,
        },
    });

    return res.status(200).json({
        message: 'Trending tags retrieved successfully',
        tags,
    });
});

// Get posts by tag slug
export const getPostsByTag = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Verify tag exists
    const tag = await prisma.tag.findUnique({
        where: { slug },
    });

    if (!tag) {
        throw new CustomError('Tag not found', 404);
    }

    // Get posts with this tag
    const posts = await prisma.post.findMany({
        where: {
            isDraft: false,
            tags: {
                some: {
                    tagId: tag.id,
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
                    profile: { select: { profilePic: true } },
                },
            },
            categories: {
                include: {
                    category: {
                        select: { id: true, name: true, slug: true, icon: true, color: true },
                    },
                },
            },
            tags: {
                include: {
                    tag: { select: { id: true, name: true, slug: true } },
                },
            },
            media: { orderBy: { order: 'asc' } },
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

    // Get total count
    const totalPosts = await prisma.post.count({
        where: {
            isDraft: false,
            tags: {
                some: {
                    tagId: tag.id,
                },
            },
        },
    });

    return res.status(200).json({
        message: 'Posts retrieved successfully',
        posts,
        tag,
        pagination: {
            total: totalPosts,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(totalPosts / Number(limit)),
        },
    });
});
