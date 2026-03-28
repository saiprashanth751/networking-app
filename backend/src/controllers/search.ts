import { Request, Response } from 'express';
import prisma from '../../prisma/prisma_client';
import { asyncHandler } from '../middleware/asyncHandler';
import CustomError from '../utils/customError';
import cacheService from '../lib/cache';

interface AuthRequest extends Request {
    id?: string;
}

export const globalSearch = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { q: query, type = 'all', limit = '10' } = req.query;
    const userId = req.id;

    if (!query || typeof query !== 'string') {
        throw new CustomError('Search query is required', 400);
    }

    // Trim and sanitize query
    const sanitizedQuery = query.trim();

    // Validate query length
    if (sanitizedQuery.length < 2) {
        throw new CustomError('Search query must be at least 2 characters', 400);
    }

    if (sanitizedQuery.length > 100) {
        throw new CustomError('Search query is too long (max 100 characters)', 400);
    }

    // Prevent SQL injection patterns (basic check)
    const dangerousPatterns = /(\bDROP\b|\bDELETE\b|\bUPDATE\b|\bINSERT\b|\bEXEC\b|\bSELECT\b.*\bFROM\b)/i;
    if (dangerousPatterns.test(sanitizedQuery)) {
        throw new CustomError('Invalid search query', 400);
    }

    // Validate type parameter
    const validTypes = ['all', 'users', 'posts', 'projects', 'tags'];
    if (!validTypes.includes(type as string)) {
        throw new CustomError('Invalid search type', 400);
    }

    const searchLimit = Math.min(parseInt(limit as string) || 10, 50); // Max 50 results
    const searchQuery = sanitizedQuery;

    // Create cache key (include userId because current user is excluded from results)
    const cacheKey = `search:${searchQuery}:${type}:${searchLimit}:user:${userId || 'guest'}`;

    // Check cache first
    const cachedResult = cacheService.get<any>(cacheKey);
    if (cachedResult) {
        return res.json(cachedResult);
    }

    const results: any = {
        users: [],
        posts: [],
        projects: [],
        tags: [],
    };

    // Search Users (exclude current user)
    if (type === 'all' || type === 'users') {
        results.users = await prisma.user.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { firstName: { contains: searchQuery, mode: 'insensitive' } },
                            { lastName: { contains: searchQuery, mode: 'insensitive' } },
                            { email: { contains: searchQuery, mode: 'insensitive' } },
                        ],
                    },
                    {
                        id: { not: userId }, // Exclude current user
                    },
                ],
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profile: {
                    select: {
                        profilePic: true,
                        bio: true,
                        department: true,
                    },
                },
            },
            take: searchLimit,
        });
    }

    // Search Posts
    if (type === 'all' || type === 'posts') {
        results.posts = await prisma.post.findMany({
            where: {
                status: 'PUBLISHED',
                OR: [
                    { title: { contains: searchQuery, mode: 'insensitive' } },
                    { contentText: { contains: searchQuery, mode: 'insensitive' } },
                ],
            },
            select: {
                id: true,
                title: true,
                contentText: true,
                publishedAt: true,
                likesCount: true,
                commentsCount: true,
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
                            select: { id: true, name: true, icon: true, color: true },
                        },
                    },
                },
                media: {
                    select: {
                        id: true,
                        url: true,
                        type: true,
                    },
                    take: 1, // Only first image for preview
                },
            },
            orderBy: {
                publishedAt: 'desc',
            },
            take: searchLimit,
        });
    }

    // Search Projects
    if (type === 'all' || type === 'projects') {
        results.projects = await prisma.project.findMany({
            where: {
                OR: [
                    { title: { contains: searchQuery, mode: 'insensitive' } },
                    { description: { contains: searchQuery, mode: 'insensitive' } },
                    { techStack: { has: searchQuery } }, // Search in array
                ],
            },
            select: {
                id: true,
                title: true,
                description: true,
                techStack: true,
                category: true,
                featured: true,
                coverImage: true,
                createdAt: true,
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profile: { select: { profilePic: true } },
                    },
                },
            },
            orderBy: [
                { featured: 'desc' },
                { createdAt: 'desc' },
            ],
            take: searchLimit,
        });
    }

    // Search Tags
    if (type === 'all' || type === 'tags') {
        results.tags = await prisma.tag.findMany({
            where: {
                name: { contains: searchQuery, mode: 'insensitive' },
            },
            select: {
                id: true,
                name: true,
                slug: true,
                _count: {
                    select: { posts: true },
                },
            },
            orderBy: {
                posts: {
                    _count: 'desc',
                },
            },
            take: searchLimit,
        });
    }

    // Save search to history (if user is logged in)
    if (userId) {
        try {
            await prisma.searchHistory.create({
                data: {
                    userId,
                    query: searchQuery,
                    type: type as string,
                },
            });
        } catch (error) {
            // Don't fail the request if history save fails
            console.error('Failed to save search history:', error);
        }
    }

    const response = {
        message: 'Search completed successfully',
        query: searchQuery,
        results,
        counts: {
            users: results.users.length,
            posts: results.posts.length,
            projects: results.projects.length,
            tags: results.tags.length,
            total: results.users.length + results.posts.length + results.projects.length + results.tags.length,
        },
    };

    // Cache the response for 5 minutes (300 seconds)
    cacheService.set(cacheKey, response, 300);

    res.json(response);
});
