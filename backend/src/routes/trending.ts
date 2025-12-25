import { Router } from 'express';
import { getTrendingTopics, getTrendingUsers } from '../controllers/trending';
import { authMiddleware } from '../middleware/authMiddleware';
import { trendingRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Get trending hashtags/topics with rate limiting (10 requests per minute)
router.get('/topics', authMiddleware, trendingRateLimiter, getTrendingTopics);

// Get trending users with rate limiting (10 requests per minute)
router.get('/users', authMiddleware, trendingRateLimiter, getTrendingUsers);

export default router;
