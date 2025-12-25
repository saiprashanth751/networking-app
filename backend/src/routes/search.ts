import { Router } from 'express';
import { globalSearch } from '../controllers/search';
import { authMiddleware } from '../middleware/authMiddleware';
import { searchRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Global search endpoint with rate limiting (30 requests per minute)
router.get('/', authMiddleware, searchRateLimiter, globalSearch);

export default router;
