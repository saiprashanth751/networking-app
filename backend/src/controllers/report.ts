import { Response, Request } from 'express';
import prisma from '../../prisma/prisma_client';
import { asyncHandler } from '../middleware/asyncHandler';
import CustomError from '../utils/customError';

interface AuthRequest extends Request {
    id?: string;
}

// ============================================================================
// REPORT POST
// ============================================================================

export const reportPost = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { postId } = req.params;
    const { reason, description } = req.body;
    const userId = req.id!;

    // Validate reason
    const validReasons = ['SPAM', 'HARASSMENT', 'INAPPROPRIATE', 'MISINFORMATION', 'OTHER'];
    if (!reason || !validReasons.includes(reason)) {
        throw new CustomError('Invalid report reason', 400);
    }

    // Check if post exists
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
        throw new CustomError('Post not found', 404);
    }

    // Check for duplicate report
    const existingReport = await prisma.postReport.findUnique({
        where: {
            postId_reporterId: {
                postId,
                reporterId: userId,
            },
        },
    });

    if (existingReport) {
        throw new CustomError('You have already reported this post', 409);
    }

    // Create report
    const report = await prisma.postReport.create({
        data: {
            postId,
            reporterId: userId,
            reason,
            description: description?.trim() || null,
        },
        select: {
            id: true,
            postId: true,
            reason: true,
            status: true,
            createdAt: true,
        },
    });

    return res.status(201).json({
        message: 'Report submitted successfully',
        report,
    });
});

// ============================================================================
// GET USER REPORTS
// ============================================================================

export const getUserReports = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.id!;

    const reports = await prisma.postReport.findMany({
        where: { reporterId: userId },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            postId: true,
            reason: true,
            status: true,
            createdAt: true,
            post: {
                select: {
                    title: true,
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            },
        },
    });

    return res.status(200).json({
        message: 'Reports retrieved successfully',
        reports,
    });
});
