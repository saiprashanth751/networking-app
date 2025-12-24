import { Response, Request } from 'express';
import prisma from '../../prisma/prisma_client';
import { asyncHandler } from '../middleware/asyncHandler';
import CustomError from '../utils/customError';

interface AuthRequest extends Request {
    id?: string;
}

// Save draft
export const saveDraft = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { title, content, contentText, categoryIds, tags } = req.body;
    const userId = req.id!;

    // Set expiration to 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const draft = await prisma.postDraft.create({
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

    return res.status(201).json({
        message: 'Draft saved successfully',
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
        orderBy: { lastSaved: 'desc' },
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
