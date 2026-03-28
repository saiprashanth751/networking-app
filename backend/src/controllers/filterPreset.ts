import { Response, Request } from 'express';
import prisma from '../../prisma/prisma_client';
import { asyncHandler } from '../middleware/asyncHandler';
import CustomError from '../utils/customError';

interface AuthRequest extends Request {
    id?: string;
}

// ============================================================================
// SAVE FILTER PRESET
// ============================================================================

export const saveFilterPreset = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, description, filters, isDefault } = req.body;
    const userId = req.id!;

    // Validation
    if (!name || name.trim().length < 3 || name.trim().length > 50) {
        throw new CustomError('Preset name must be between 3 and 50 characters', 400);
    }

    if (!filters || typeof filters !== 'object') {
        throw new CustomError('Invalid filters configuration', 400);
    }

    // If setting as default, unset other defaults
    if (isDefault === true) {
        await prisma.filterPreset.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false },
        });
    }

    // Create preset
    const preset = await prisma.filterPreset.create({
        data: {
            userId,
            name: name.trim(),
            description: description?.trim() || null,
            filters,
            isDefault: isDefault || false,
        },
    });

    return res.status(201).json({
        message: 'Filter preset saved successfully',
        preset,
    });
});

// ============================================================================
// GET USER PRESETS
// ============================================================================

export const getUserPresets = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.id!;

    const presets = await prisma.filterPreset.findMany({
        where: { userId },
        orderBy: [
            { isDefault: 'desc' },
            { createdAt: 'desc' },
        ],
    });

    return res.status(200).json({
        message: 'Presets retrieved successfully',
        presets,
    });
});

// ============================================================================
// DELETE PRESET
// ============================================================================

export const deletePreset = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { presetId } = req.params;
    const userId = req.id!;

    // Verify ownership
    const preset = await prisma.filterPreset.findUnique({
        where: { id: presetId },
    });

    if (!preset) {
        throw new CustomError('Preset not found', 404);
    }

    if (preset.userId !== userId) {
        throw new CustomError('Not authorized to delete this preset', 403);
    }

    // Delete preset
    await prisma.filterPreset.delete({
        where: { id: presetId },
    });

    return res.status(200).json({
        message: 'Preset deleted successfully',
    });
});
