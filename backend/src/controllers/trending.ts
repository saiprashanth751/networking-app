import { Request, Response } from 'express';
import prisma from '../../prisma/prisma_client';
import { asyncHandler } from '../middleware/asyncHandler';
import cacheService from '../lib/cache';

interface AuthRequest extends Request {
    id?: string;
}

export const getTrendingTopics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { limit = '10', days = '7' } = req.query;
    const limitNum = Math.min(parseInt(limit as string) || 10, 50);
    const daysNum = parseInt(days as string) || 7;

    // Create cache key
    const cacheKey = `trending:topics:${limitNum}:${daysNum}`;

    // Check cache first (30 minute TTL)
    const cachedResult = cacheService.get<any>(cacheKey);
    if (cachedResult) {
        return res.json(cachedResult);
    }

    // Calculate date threshold
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysNum);

    // Limit to most recent 1000 posts to prevent performance issues
    const recentPosts = await prisma.post.findMany({
        where: {
            status: 'PUBLISHED',
            publishedAt: {
                gte: dateThreshold,
            },
        },
        select: {
            publishedAt: true, // Need this for time decay
            tags: {
                select: {
                    tag: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            publishedAt: 'desc',
        },
        take: 1000, // Limit to prevent memory issues
    });

    // Count tag occurrences with time decay (more recent = higher weight)
    const tagCounts = new Map<string, { id: string; name: string; slug: string; count: number; score: number }>();
    const now = Date.now();

    recentPosts.forEach((post) => {
        // Calculate recency weight (posts from today = 1.0, posts from 7 days ago = ~0.3)
        const publishedDate = post.publishedAt ? new Date(post.publishedAt) : new Date();
        const postAge = now - publishedDate.getTime();
        const daysSincePost = postAge / (1000 * 60 * 60 * 24);
        const recencyWeight = Math.max(0.3, 1 - (daysSincePost / (daysNum * 2))); // Decay over 2x the period

        post.tags.forEach(({ tag }) => {
            const existing = tagCounts.get(tag.id);
            if (existing) {
                existing.count++;
                existing.score += recencyWeight; // Use weighted score
            } else {
                tagCounts.set(tag.id, {
                    id: tag.id,
                    name: tag.name,
                    slug: tag.slug,
                    count: 1,
                    score: recencyWeight,
                });
            }
        });
    });

    // Convert to array and sort by score (not just count)
    const trending = Array.from(tagCounts.values())
        .filter((tag) => tag.count >= 2) // Minimum 2 occurrences to be trending
        .sort((a, b) => b.score - a.score) // Sort by weighted score
        .slice(0, limitNum)
        .map(({ id, name, slug, count }) => ({ id, name, slug, count })); // Remove score from response

    const response = {
        message: 'Trending topics retrieved successfully',
        trending,
        period: `${daysNum} days`,
    };

    // Cache for 30 minutes (1800 seconds)
    cacheService.set(cacheKey, response, 1800);

    res.json(response);
});

/**
 * Get trending users based on engagement (likes, comments, followers)
 * GET /api/trending/users?limit=5
 */
export const getTrendingUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { limit = '5' } = req.query;
    const limitNum = Math.min(parseInt(limit as string) || 5, 20);

    // Get users with their post engagement counts
    const users = await prisma.user.findMany({
        select: {
            id: true,
            firstName: true,
            lastName: true,
            profile: {
                select: {
                    profilePic: true,
                    bio: true,
                    department: true,
                },
            },
            posts: {
                where: {
                    status: 'PUBLISHED',
                },
                select: {
                    likesCount: true,
                    commentsCount: true,
                },
            },
            followers: {
                select: {
                    followerId: true,
                },
            },
        },
        take: 100, // Get top 100 to calculate engagement
    });

    // Calculate engagement score
    const usersWithScore = users.map((user) => {
        const totalLikes = user.posts.reduce((sum, post) => sum + post.likesCount, 0);
        const totalComments = user.posts.reduce((sum, post) => sum + post.commentsCount, 0);
        const followersCount = user.followers.length;

        // Engagement score formula (weighted)
        const engagementScore = (totalLikes * 1) + (totalComments * 2) + (followersCount * 3);

        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            profile: user.profile,
            stats: {
                followers: followersCount,
                totalLikes,
                totalComments,
                engagementScore,
            },
        };
    });

    // Sort by engagement score and get top N
    const trending = usersWithScore
        .sort((a, b) => b.stats.engagementScore - a.stats.engagementScore)
        .slice(0, limitNum);

    res.json({
        message: 'Trending users retrieved successfully',
        trending,
    });
});
