import { Router } from 'express';
import { saveDraft, getUserDrafts, getDraft, deleteDraft, cleanupExpiredDrafts } from '../controllers/draft';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/', saveDraft);
router.get('/', getUserDrafts);
router.get('/:id', getDraft);
router.delete('/:id', deleteDraft);
router.post('/cleanup', cleanupExpiredDrafts);

export default router;
