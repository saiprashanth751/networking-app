import { Router } from 'express';
import { uploadMedia, getMediaById, deleteMedia } from '../controllers/media';
import { authMiddleware } from '../middleware/authMiddleware';
import upload from '../middleware/fileMiddleware';

const router = Router();

// POST /api/v1/media/upload - Upload and optimize media
router.post('/upload', authMiddleware, upload.single('file'), uploadMedia);

// GET /api/v1/media/:id - Get media by ID
router.get('/:id', getMediaById);

// DELETE /api/v1/media/:id - Delete media (requires auth)
router.delete('/:id', authMiddleware, deleteMedia);

export default router;
