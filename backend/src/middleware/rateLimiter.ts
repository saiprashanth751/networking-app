import rateLimit from 'express-rate-limit';

/**
 * Rate Limiter for Search API
 * 
 * Limits: 30 requests per minute per IP
 * Prevents abuse and DoS attacks
 */
export const searchRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    message: 'Too many search requests from this IP, please try again after a minute',
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    handler: (_req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many search requests. Please wait a moment and try again.',
        });
    },
});

/**
 * Rate Limiter for Trending API
 * 
 * Limits: 10 requests per minute per IP
 * Less strict since trending is cached
 */
export const trendingRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    message: 'Too many requests for trending data',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many requests. Please wait a moment.',
        });
    },
});

/**
 * General API Rate Limiter
 * 
 * Limits: 100 requests per minute per IP
 * Applied to all API routes as base protection
 */
export const generalRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: 'Too many requests from this IP',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for health check endpoints
        return req.path === '/health' || req.path === '/api/health';
    },
});
