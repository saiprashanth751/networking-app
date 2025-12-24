import { Router } from 'express';
import { saveDraft, getUserDrafts, getDraft, deleteDraft, cleanupExpiredDrafts } from '../controllers/draft';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All draft routes require authentication
router.use(authMiddleware);

// Save/update draft
router.post('/', saveDraft);

// Get user's drafts
router.get('/', getUserDrafts);

// Get single draft
router.get('/:id', getDraft);

// Delete draft
router.delete('/:id', deleteDraft);

// Cleanup expired drafts (can be protected/admin-only in production)
router.post('/cleanup', cleanupExpiredDrafts);

export default router;
