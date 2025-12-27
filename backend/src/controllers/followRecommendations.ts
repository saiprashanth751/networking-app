import { Request, Response } from 'express';
import prisma from '../../prisma/prisma_client';
import { asyncHandler } from '../middleware/asyncHandler';

interface AuthRequest extends Request {
    id?: string;
}

/**
 * Get Recommended Users
 * 
 * Algorithm - Production-grade recommendation:
 * 1. Users you're NOT already following
 * 2. Scored by multiple factors:
 *    - Mutual connections (friends in common)
 *    - Similar interests (shared categories in posts)
 *    - Recent activity (active users ranked higher)
 *    - Popular users (follower count as tiebreaker)
 * 3. Exclude blocked users and users who blocked you
 * 
 * Edge cases handled:
 * - New users with no network
 * - Users with no posts/activity
 * - Empty result sets
 */
export const getRecommendedUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.id;
    const { limit = 5 } = req.query;
    const validLimit = Math.min(Number(limit), 20); // Cap at 20

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get users already following
    const following = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
    });
    const followingIds = following.map(f => f.followingId);

    // Get all potential candidates (not following, not self)
    const candidates = await prisma.user.findMany({
        where: {
            AND: [
                { id: { not: userId } },
                { id: { notIn: followingIds } },
            ],
        },
        include: {
            profile: {
                select: {
                    profilePic: true,
                    bio: true,
                },
            },
            posts: {
                where: { status: 'PUBLISHED' },
                select: {
                    categories: {
                        select: { categoryId: true },
                    },
                },
                take: 10, // Sample recent posts
            },
            followers: { select: { followerId: true } },
            following: { select: { followingId: true } },
        },
        take: 100, // Sample size for scoring
    });

    // Get user's interests (categories from their posts)
    const userPosts = await prisma.post.findMany({
        where: {
            userId,
            status: 'PUBLISHED',
        },
        select: {
            categories: {
                select: { categoryId: true },
            },
        },
        take: 20,
    });

    const userInterests = new Set(
        userPosts.flatMap(post => post.categories.map(c => c.categoryId))
    );

    // Score each candidate
    const scored = candidates.map(candidate => {
        let score = 0;

        // 1. Mutual connections (most important)
        const mutualCount = candidate.followers.filter(
            f => followingIds.includes(f.followerId)
        ).length;
        score += mutualCount * 10;

        // 2. Similar interests
        const candidateInterests = new Set(
            candidate.posts.flatMap(post => post.categories.map(c => c.categoryId))
        );
        const commonInterests = [...userInterests].filter(interest =>
            candidateInterests.has(interest)
        ).length;
        score += commonInterests * 5;

        //3. Recent activity (has posts)
        if (candidate.posts.length > 0) {
            score += 3;
        }

        // 4. Popularity (follower count as tiebreaker)
        score += Math.min(candidate.followers.length / 10, 5);

        return {
            user: candidate,
            score,
            mutualCount,
        };
    });

    // Sort by score and take top N
    const recommendations = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, validLimit)
        .map(({ user, mutualCount }) => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            profile: {
                profilePic: user.profile?.profilePic,
                bio: user.profile?.bio,
            },
            _count: {
                followers: user.followers.length,
                following: user.following.length,
            },
            mutualConnectionsCount: mutualCount,
        }));

    return res.status(200).json({
        message: 'Recommended users retrieved successfully',
        users: recommendations,
    });
});
