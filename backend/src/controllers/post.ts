import { Response, Request } from 'express';
import prisma from '../../prisma/prisma_client';
import { asyncHandler } from '../middleware/asyncHandler';
import CustomError from '../utils/customError';

interface AuthRequest extends Request {
    id?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Extract plain text from Lexical JSON for search
function extractTextFromLexical(content: any): string {
    try {
        if (!content || !content.root || !content.root.children) {
            return '';
        }

        const extractFromNode = (node: any): string => {
            if (node.text) {
                return node.text;
            }
            if (node.children && Array.isArray(node.children)) {
                return node.children.map(extractFromNode).join(' ');
            }
            return '';
        };

        return content.root.children.map(extractFromNode).join('\n');
    } catch (error) {
        console.error('Failed to extract text from Lexical:', error);
        return '';
    }
}

// Extract hashtags from content text
function extractHashtags(text: string): string[] {
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];
}

// ============================================================================
// CREATE DRAFT POST (Production Workflow - Step 1)
// ============================================================================

export const createDraft = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { title, content, categoryIds } = req.body;

    if (!content) {
        throw new CustomError('Content is required', 400);
    }

    // Extract plain text for search
    const contentText = extractTextFromLexical(content);

    // Create draft post
    const post = await prisma.post.create({
        data: {
            title: title || null,
            content,
            contentText,
            status: 'DRAFT',  // Production workflow
            userId: req.id!,
            // Create category relationships
            categories: categoryIds && categoryIds.length > 0 ? {
                create: categoryIds.map((catId: string) => ({
                    categoryId: catId,
                })),
            } : undefined,
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
            categories: {
                include: {
                    category: true,
                },
            },
        },
    });

    return res.status(201).json({
        message: 'Draft post created',
        post,
    });
});

// ============================================================================
// PUBLISH POST (Production Workflow - Step 3)
// ============================================================================

export const publishPost = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { postId } = req.params;

    // Verify post exists and belongs to user
    const existingPost = await prisma.post.findFirst({
        where: {
            id: postId,
            userId: req.id,
            status: 'DRAFT',
        },
    });

    if (!existingPost) {
        throw new CustomError('Draft post not found or already published', 404);
    }

    // Extract hashtags from content
    const contentText = extractTextFromLexical(existingPost.content);
    const extractedHashtags = extractHashtags(contentText);

    // Update post to published with hashtags
    const post = await prisma.post.update({
        where: { id: postId },
        data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
            // Create or connect tags
            tags: extractedHashtags.length > 0 ? {
                create: await Promise.all(
                    extractedHashtags.map(async (tagName: string) => {
                        // Find or create tag
                        const tag = await prisma.tag.upsert({
                            where: { slug: tagName },
                            update: { usageCount: { increment: 1 } },
                            create: {
                                name: tagName,
                                slug: tagName,
                                usageCount: 1,
                            },
                        });
                        return { tagId: tag.id };
                    })
                ),
            } : undefined,
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
            categories: {
                include: {
                    category: true,
                },
            },
            tags: {
                include: {
                    tag: true,
                },
            },
            media: true,
        },
    });

    return res.status(200).json({
        message: 'Post published successfully',
        post,
    });
});

// ============================================================================
// CREATE POST
// ============================================================================

export const createPost = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { title, content, categoryIds, tags } = req.body;

    if (!content) {
        throw new CustomError('Content is required', 400);
    }

    // Extract plain text for search
    const contentText = extractTextFromLexical(content);

    // Extract hashtags from content
    const extractedHashtags = extractHashtags(contentText);
    const allTags = [...new Set([...(tags || []), ...extractedHashtags])];

    // Handle media files from request
    let mediaUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
        mediaUrls = req.files.map((file: any) => file.cloudinaryUrl);
    }

    // Create post with relationships
    const post = await prisma.post.create({
        data: {
            title: title || null,
            content,
            contentText,
            status: 'PUBLISHED',
            publishedAt: new Date(),
            userId: req.id!,
            // Create category relationships
            categories: categoryIds && categoryIds.length > 0 ? {
                create: categoryIds.map((catId: string) => ({
                    categoryId: catId,
                })),
            } : undefined,
            // Create or connect tags
            tags: allTags.length > 0 ? {
                create: await Promise.all(
                    allTags.map(async (tagName: string) => {
                        // Find or create tag
                        const tag = await prisma.tag.upsert({
                            where: { slug: tagName },
                            update: { usageCount: { increment: 1 } },
                            create: {
                                name: tagName,
                                slug: tagName,
                                usageCount: 1,
                            },
                        });
                        return { tagId: tag.id };
                    })
                ),
            } : undefined,
            // Create media entries
            media: mediaUrls.length > 0 ? {
                create: mediaUrls.map((url, index) => ({
                    type: 'IMAGE',
                    url,
                    fileName: `image-${index}`,
                    fileSize: 0, // TODO: Get actual file size
                    mimeType: 'image/jpeg', // TODO: Get actual mime type
                    order: index,
                })),
            } : undefined,
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
        },
    });

    // Update category post counts
    if (categoryIds && categoryIds.length > 0) {
        await prisma.category.updateMany({
            where: { id: { in: categoryIds } },
            data: { postsCount: { increment: 1 } },
        });
    }

    return res.status(201).json({
        message: 'Post created successfully',
        post,
    });
});

// ============================================================================
// GET ALL POSTS (FEED) - Enhanced with Cursor Pagination & Advanced Filters
// ============================================================================

export const getAllPosts = asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
        // Pagination
        cursor,        // Post ID for cursor-based pagination
        limit = 10,    // Default: 10, Max: 50
        page,          // Legacy support (backward compatibility)

        // Filtering
        categorySlug,     // Single category (legacy, deprecated)
        categorySlugs,    // Multiple categories (comma-separated)
        tagSlug,          // Single tag (legacy, deprecated)
        tagSlugs,         // Multiple tags (comma-separated)
        followingOnly,    // boolean: only posts from followed users
        type,             // 'all', 'posts', 'projects', 'jobs'

        // Sorting
        sort = 'recent'   // 'recent', 'popular', 'trending'
    } = req.query;

    const userId = req.id;
    const limitNum = Math.min(Number(limit), 50); // Cap at 50

    // Build where clause
    const where: any = { status: 'PUBLISHED' };

    // Filter by categories (support both single and multiple)
    const categorySlugsArray = categorySlugs
        ? (categorySlugs as string).split(',').map(s => s.trim())
        : categorySlug ? [categorySlug as string] : [];

    if (categorySlugsArray.length > 0) {
        const categories = await prisma.category.findMany({
            where: { slug: { in: categorySlugsArray } },
            select: { id: true },
        });

        if (categories.length > 0) {
            where.categories = {
                some: { categoryId: { in: categories.map(c => c.id) } },
            };
        }
    }

    // Filter by tags (support both single and multiple)
    const tagSlugsArray = tagSlugs
        ? (tagSlugs as string).split(',').map(s => s.trim())
        : tagSlug ? [tagSlug as string] : [];

    if (tagSlugsArray.length > 0) {
        const tags = await prisma.tag.findMany({
            where: { slug: { in: tagSlugsArray } },
            select: { id: true },
        });

        if (tags.length > 0) {
            where.tags = {
                some: { tagId: { in: tags.map(t => t.id) } },
            };
        }
    }

    // Filter by following (only posts from followed users)
    if (followingOnly === 'true' && userId) {
        const following = await prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        });

        const followingIds = following.map(f => f.followingId);
        if (followingIds.length > 0) {
            where.userId = { in: followingIds };
        } else {
            // No following, return empty result
            return res.status(200).json({
                message: 'Posts retrieved successfully',
                posts: [],
                nextCursor: undefined,
                hasMore: false,
            });
        }
    }

    // Filter by type (content type)
    // TODO: Implement when category types are fully defined
    // For now, this is a placeholder for future feature

    // Cursor-based pagination
    if (cursor) {
        where.id = { lt: cursor as string }; // Posts before this cursor
    }

    // Sort options
    let orderBy: any = { publishedAt: 'desc' };

    if (sort === 'popular') {
        orderBy = { likesCount: 'desc' };
    } else if (sort === 'trending') {
        // Trending: Custom score-based ranking
        // Score = likesCount*2 + commentsCount*3 + sharesCount*5
        // NOTE: Prisma doesn't support computed columns in orderBy
        // So we'll fetch posts and sort in-memory for trending
        // For better performance, consider using raw SQL or database views
    }

    // Fetch posts
    let posts = await prisma.post.findMany({
        where,
        take: limitNum + 1, // Fetch one extra to determine hasMore
        orderBy: sort === 'trending' ? { publishedAt: 'desc' } : orderBy,
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
            likes: {
                select: { userId: true },
            },
            bookmarks: {
                select: { userId: true },
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

    // Apply trending sort in-memory if needed
    if (sort === 'trending') {
        posts = posts.sort((a, b) => {
            const scoreA = (a.likesCount * 2) + (a.commentsCount * 3) + (a.sharesCount * 5);
            const scoreB = (b.likesCount * 2) + (b.commentsCount * 3) + (b.sharesCount * 5);

            if (scoreB !== scoreA) {
                return scoreB - scoreA; // Higher score first
            }

            // Tie-breaker: more recent first
            return new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime();
        });
    }

    // Determine if there are more posts
    const hasMore = posts.length > limitNum;
    const postsToReturn = hasMore ? posts.slice(0, limitNum) : posts;

    // Next cursor is the ID of the last post
    const nextCursor = hasMore ? postsToReturn[postsToReturn.length - 1]?.id : undefined;

    // Transform posts to include isLiked and isBookmarked for current user
    const transformedPosts = postsToReturn.map((post: any) => ({
        ...post,
        isLiked: post.likes?.some((like: any) => like.userId === userId) || false,
        isBookmarked: post.bookmarks?.some((bookmark: any) => bookmark.userId === userId) || false,
        likes: undefined, // Remove from response
        bookmarks: undefined, // Remove from response
    }));

    // Legacy pagination support (when page param is used)
    if (page) {
        const offset = (Number(page) - 1) * limitNum;
        const totalPosts = await prisma.post.count({ where });

        return res.status(200).json({
            message: 'Posts retrieved successfully',
            posts: transformedPosts,
            pagination: {
                total: totalPosts,
                page: Number(page),
                limit: limitNum,
                totalPages: Math.ceil(totalPosts / limitNum),
            },
        });
    }

    // Cursor-based response
    return res.status(200).json({
        message: 'Posts retrieved successfully',
        posts: transformedPosts,
        nextCursor,
        hasMore,
    });
});

// ============================================================================
// GET SINGLE POST
// ============================================================================

export const getPostById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
        where: { id },
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
            likes: {
                select: { userId: true },
            },
            bookmarks: {
                select: { userId: true },
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

    if (!post) {
        throw new CustomError('Post not found', 404);
    }

    // Increment view count
    await prisma.post.update({
        where: { id },
        data: { viewsCount: { increment: 1 } },
    });

    // Transform to include isLiked and isBookmarked
    const transformedPost = {
        ...post,
        isLiked: (req as any).id ? (post.likes?.some((like: any) => like.userId === (req as any).id) || false) : false,
        isBookmarked: (req as any).id ? (post.bookmarks?.some((bookmark: any) => bookmark.userId === (req as any).id) || false) : false,
        likes: undefined,
        bookmarks: undefined,
    };

    return res.status(200).json({
        message: 'Post retrieved successfully',
        post: transformedPost,
    });
});

// ============================================================================
// GET USER POSTS
// ============================================================================

export const getUserPosts = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.id!;

    const posts = await prisma.post.findMany({
        where: { userId, status: 'PUBLISHED' },
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
            likes: {
                select: { userId: true },
            },
            bookmarks: {
                select: { userId: true },
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

    // Transform for current user
    const transformedPosts = posts.map(post => ({
        ...post,
        isLiked: post.likes?.some((like: any) => like.userId === req.id) || false,
        isBookmarked: post.bookmarks?.some((bookmark: any) => bookmark.userId === req.id) || false,
        likes: undefined,
        bookmarks: undefined,
    }));

    return res.status(200).json({
        message: 'Posts retrieved successfully',
        posts: transformedPosts,
    });
});

// ============================================================================
// GET POSTS BY USER ID (For viewing other users' profiles)
// ============================================================================

export const getPostsByUserId = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
        throw new CustomError('User ID is required', 400);
    }

    const posts = await prisma.post.findMany({
        where: { userId, status: 'PUBLISHED' },
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
            likes: {
                select: { userId: true },
            },
            bookmarks: {
                select: { userId: true },
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

    // Transform for current user (if logged in)
    const transformedPosts = posts.map(post => ({
        ...post,
        isLiked: req.id ? (post.likes?.some((like: any) => like.userId === req.id) || false) : false,
        isBookmarked: req.id ? (post.bookmarks?.some((bookmark: any) => bookmark.userId === req.id) || false) : false,
        likes: undefined,
        bookmarks: undefined,
    }));

    return res.status(200).json({
        message: 'Posts retrieved successfully',
        posts: transformedPosts,
    });
});

// ============================================================================
// UPDATE POST
// ============================================================================

export const updatePost = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { title, content, categoryIds, tags } = req.body;
    const userId = req.id!;

    // Check ownership
    const existingPost = await prisma.post.findUnique({
        where: { id },
    });

    if (!existingPost) {
        throw new CustomError('Post not found', 404);
    }

    if (existingPost.userId !== userId) {
        throw new CustomError('Not authorized to update this post', 403);
    }

    // Extract plain text - content comes as JSON string from request
    let contentText = existingPost.contentText;
    if (content) {
        try {
            const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
            contentText = extractTextFromLexical(parsedContent);
        } catch (error) {
            console.error('Failed to parse content for text extraction:', error);
        }
    }

    // Create edit history entry
    await prisma.postEdit.create({
        data: {
            postId: id,
            title: existingPost.title,
            content: existingPost.content as any, // Cast to avoid JsonValue type issue
            editedBy: userId,
        },
    });

    // Update post
    const post = await prisma.post.update({
        where: { id },
        data: {
            title: title !== undefined ? title : existingPost.title,
            content: content || existingPost.content,
            contentText,
            editedAt: new Date(),
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
        },
    });

    return res.status(200).json({
        message: 'Post updated successfully',
        post,
    });
});

// ============================================================================
// DELETE POST
// ============================================================================

export const deletePost = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.id!;

    // Check ownership
    const existingPost = await prisma.post.findUnique({
        where: { id },
        include: {
            categories: { include: { category: true } },
        },
    });

    if (!existingPost) {
        throw new CustomError('Post not found', 404);
    }

    if (existingPost.userId !== userId) {
        throw new CustomError('Not authorized to delete this post', 403);
    }

    // Decrement category counts
    const categoryIds = existingPost.categories.map(c => c.categoryId);
    if (categoryIds.length > 0) {
        await prisma.category.updateMany({
            where: { id: { in: categoryIds } },
            data: { postsCount: { decrement: 1 } },
        });
    }

    // Delete post (cascade will handle relations)
    await prisma.post.delete({
        where: { id },
    });

    return res.status(200).json({
        message: 'Post deleted successfully',
    });
});
