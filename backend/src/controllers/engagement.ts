import { Response, Request } from 'express';
import prisma from '../../prisma/prisma_client';
import { asyncHandler } from '../middleware/asyncHandler';
import CustomError from '../utils/customError';

interface AuthRequest extends Request {
    id?: string;
}

// ============================================================================
// LIKES
// ============================================================================

// Toggle like on post
export const toggleLike = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { postId } = req.params;
    const userId = req.id!;

    // Check if post exists
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
        throw new CustomError('Post not found', 404);
    }

    // Check if already liked
    const existingLike = await prisma.postLike.findUnique({
        where: {
            postId_userId: {
                postId,
                userId,
            },
        },
    });

    if (existingLike) {
        // Unlike
        await prisma.postLike.delete({
            where: { id: existingLike.id },
        });

        // Decrement counter
        await prisma.post.update({
            where: { id: postId },
            data: { likesCount: { decrement: 1 } },
        });

        return res.status(200).json({
            message: 'Post unliked',
            liked: false,
        });
    } else {
        // Like
        await prisma.postLike.create({
            data: {
                postId,
                userId,
            },
        });

        // Increment counter
        await prisma.post.update({
            where: { id: postId },
            data: { likesCount: { increment: 1 } },
        });

        return res.status(201).json({
            message: 'Post liked',
            liked: true,
        });
    }
});

// Get likes for a post
export const getPostLikes = asyncHandler(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const likes = await prisma.postLike.findMany({
        where: { postId },
        skip: offset,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profile: { select: { profilePic: true } },
                },
            },
        },
    });

    const total = await prisma.postLike.count({ where: { postId } });

    return res.status(200).json({
        message: 'Likes retrieved successfully',
        likes,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
        },
    });
});

// ============================================================================
// COMMENTS
// ============================================================================

// Add comment to post
export const addComment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { postId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.id!;

    if (!content || !content.trim()) {
        throw new CustomError('Comment content is required', 400);
    }

    // Check if post exists
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
        throw new CustomError('Post not found', 404);
    }

    // Create comment
    const comment = await prisma.comment.create({
        data: {
            postId,
            userId,
            content: content.trim(),
            parentId: parentId || null,
        },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profile: { select: { profilePic: true } },
                },
            },
            _count: { select: { likes: true, replies: true } },
        },
    });

    // Increment post comment count
    await prisma.post.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } },
    });

    return res.status(201).json({
        message: 'Comment added successfully',
        comment,
    });
});

// Get comments for a post
export const getPostComments = asyncHandler(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { page = 1, limit = 20, sort = 'recent' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Sort options
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'popular') {
        orderBy = { likesCount: 'desc' };
    }

    // Get top-level comments only (no parentId)
    const comments = await prisma.comment.findMany({
        where: {
            postId,
            parentId: null,
        },
        skip: offset,
        take: Number(limit),
        orderBy,
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profile: { select: { profilePic: true } },
                },
            },
            likes: {
                select: { userId: true },
            },
            replies: {
                take: 3, // Show first 3 replies
                orderBy: { createdAt: 'asc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            profile: { select: { profilePic: true } },
                        },
                    },
                    likes: {
                        select: { userId: true },
                    },
                    _count: { select: { likes: true } },
                },
            },
            _count: {
                select: { likes: true, replies: true },
            },
        },
    });

    const total = await prisma.comment.count({
        where: { postId, parentId: null },
    });

    // Cast for AuthRequest userId
    const userId = (req as any).id;

    // Transform to include isLiked
    const transformedComments = comments.map(comment => ({
        ...comment,
        isLiked: userId ? comment.likes?.some(like => like.userId === userId) || false : false,
        likes: undefined, // Remove from response
        replies: comment.replies.map((reply: any) => ({
            ...reply,
            isLiked: userId ? reply.likes?.some((like: any) => like.userId === userId) || false : false,
            likes: undefined,
        })),
    }));

    return res.status(200).json({
        message: 'Comments retrieved successfully',
        comments: transformedComments,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
        },
    });
});

// Get replies for a comment
export const getCommentReplies = asyncHandler(async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const replies = await prisma.comment.findMany({
        where: { parentId: commentId },
        skip: offset,
        take: Number(limit),
        orderBy: { createdAt: 'asc' },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profile: { select: { profilePic: true } },
                },
            },
            _count: { select: { likes: true } },
        },
    });

    const total = await prisma.comment.count({ where: { parentId: commentId } });

    return res.status(200).json({
        message: 'Replies retrieved successfully',
        replies,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
        },
    });
});

// Delete comment
export const deleteComment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { commentId } = req.params;
    const userId = req.id!;

    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: {
            post: {
                select: { userId: true }, // Get post owner
            },
        },
    });

    if (!comment) {
        throw new CustomError('Comment not found', 404);
    }

    // Authorization: Comment owner OR post owner can delete
    const isCommentOwner = comment.userId === userId;
    const isPostOwner = comment.post.userId === userId;

    if (!isCommentOwner && !isPostOwner) {
        throw new CustomError('Not authorized to delete this comment', 403);
    }

    // Delete comment (cascade will handle replies)
    await prisma.comment.delete({
        where: { id: commentId },
    });

    // Decrement post comment count
    await prisma.post.update({
        where: { id: comment.postId },
        data: { commentsCount: { decrement: 1 } },
    });

    return res.status(200).json({
        message: 'Comment deleted successfully',
    });
});

// Toggle like on comment
export const toggleCommentLike = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { commentId } = req.params;
    const userId = req.id!;

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
        throw new CustomError('Comment not found', 404);
    }

    const existingLike = await prisma.commentLike.findUnique({
        where: {
            commentId_userId: {
                commentId,
                userId,
            },
        },
    });

    if (existingLike) {
        // Unlike
        await prisma.commentLike.delete({ where: { id: existingLike.id } });
        await prisma.comment.update({
            where: { id: commentId },
            data: { likesCount: { decrement: 1 } },
        });

        return res.status(200).json({
            message: 'Comment unliked',
            liked: false,
        });
    } else {
        // Like
        await prisma.commentLike.create({
            data: { commentId, userId },
        });
        await prisma.comment.update({
            where: { id: commentId },
            data: { likesCount: { increment: 1 } },
        });

        return res.status(201).json({
            message: 'Comment liked',
            liked: true,
        });
    }
});

// ============================================================================
// BOOKMARKS
// ============================================================================

// Toggle bookmark on post
export const toggleBookmark = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { postId } = req.params;
    const userId = req.id!;
    const { collectionId } = req.body;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
        throw new CustomError('Post not found', 404);
    }

    const existingBookmark = await prisma.bookmark.findUnique({
        where: {
            postId_userId: {
                postId,
                userId,
            },
        },
    });

    if (existingBookmark) {
        // Remove bookmark
        await prisma.bookmark.delete({ where: { id: existingBookmark.id } });
        await prisma.post.update({
            where: { id: postId },
            data: { bookmarksCount: { decrement: 1 } },
        });

        return res.status(200).json({
            message: 'Bookmark removed',
            bookmarked: false,
        });
    } else {
        // Add bookmark
        await prisma.bookmark.create({
            data: {
                postId,
                userId,
                collectionId: collectionId || null,
            },
        });
        await prisma.post.update({
            where: { id: postId },
            data: { bookmarksCount: { increment: 1 } },
        });

        return res.status(201).json({
            message: 'Post bookmarked',
            bookmarked: true,
        });
    }
});

// Get user's bookmarks
export const getUserBookmarks = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.id!;
    const { page = 1, limit = 10, collectionId } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where: any = { userId };
    if (collectionId) {
        where.collectionId = collectionId;
    }

    const bookmarks = await prisma.bookmark.findMany({
        where,
        skip: offset,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
            post: {
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            profile: { select: { profilePic: true } },
                        },
                    },
                    media: { orderBy: { order: 'asc' } },
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                            bookmarks: true,
                        },
                    },
                },
            },
        },
    });

    const total = await prisma.bookmark.count({ where });

    return res.status(200).json({
        message: 'Bookmarks retrieved successfully',
        bookmarks,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
        },
    });
});

// ============================================================================
// SHARES
// ============================================================================

// Record share
export const recordShare = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { postId } = req.params;
    const { platform } = req.body;
    const userId = req.id!;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
        throw new CustomError('Post not found', 404);
    }

    await prisma.postShare.create({
        data: {
            postId,
            userId,
            platform: platform || null,
        },
    });

    await prisma.post.update({
        where: { id: postId },
        data: { sharesCount: { increment: 1 } },
    });

    return res.status(201).json({
        message: 'Share recorded',
    });
});
