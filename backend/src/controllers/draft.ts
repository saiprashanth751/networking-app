import { Response, Request } from 'express';
import prisma from '../../prisma/prisma_client';
import { asyncHandler } from '../middleware/asyncHandler';
import CustomError from '../utils/customError';

interface AuthRequest extends Request {
    id?: string;
}

// Save draft (Single draft per user - upsert pattern)
export const saveDraft = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { title, content, contentText, categoryIds, tags } = req.body;
    const userId = req.id!;

    // Set expiration to 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Find existing draft for this user
    const existingDraft = await prisma.postDraft.findFirst({
        where: { userId },
    });

    let draft;

    if (existingDraft) {
        // Update existing draft (single draft per user)
        draft = await prisma.postDraft.update({
            where: { id: existingDraft.id },
            data: {
                title: title || null,
                content,
                contentText: contentText || null,
                categoryIds: categoryIds || [],
                tags: tags || [],
                expiresAt,
            },
        });
    } else {
        // Create first draft for this user
        draft = await prisma.postDraft.create({
            data: {
                userId,
                title: title || null,
                content,
                contentText: contentText || null,
                categoryIds: categoryIds || [],
                tags: tags || [],
                expiresAt,
            },
        });
    }

    return res.status(existingDraft ? 200 : 201).json({
        message: existingDraft ? 'Draft updated successfully' : 'Draft created successfully',
        draft,
    });
});

// Get user drafts
export const getUserDrafts = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.id!;

    const drafts = await prisma.postDraft.findMany({
        where: {
            userId,
            expiresAt: { gt: new Date() }, // Only non-expired drafts
        },
        orderBy: { updatedAt: 'desc' }, // Most recently updated first
    });

    return res.status(200).json({
        message: 'Drafts retrieved successfully',
        drafts,
    });
});

// Get single draft
export const getDraft = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.id!;

    const draft = await prisma.postDraft.findUnique({
        where: { id },
    });

    if (!draft) {
        throw new CustomError('Draft not found', 404);
    }

    if (draft.userId !== userId) {
        throw new CustomError('Not authorized', 403);
    }

    return res.status(200).json({
        message: 'Draft retrieved successfully',
        draft,
    });
});

// Delete draft
export const deleteDraft = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.id!;

    const draft = await prisma.postDraft.findUnique({
        where: { id },
    });

    if (!draft) {
        throw new CustomError('Draft not found', 404);
    }

    if (draft.userId !== userId) {
        throw new CustomError('Not authorized', 403);
    }

    await prisma.postDraft.delete({
        where: { id },
    });

    return res.status(200).json({
        message: 'Draft deleted successfully',
    });
});

// Clean up expired drafts (can be called by a cron job)
export const cleanupExpiredDrafts = asyncHandler(async (req: Request, res: Response) => {
    const result = await prisma.postDraft.deleteMany({
        where: {
            expiresAt: { lt: new Date() },
        },
    });

    return res.status(200).json({
        message: 'Expired drafts cleaned up',
        deletedCount: result.count,
    });
});
