import { Router } from 'express';
import {
    toggleLike,
    getPostLikes,
    addComment,
    getPostComments,
    getCommentReplies,
    deleteComment,
    toggleCommentLike,
    toggleBookmark,
    getUserBookmarks,
    recordShare,
} from '../controllers/engagement';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All engagement routes require authentication
router.use(authMiddleware);

// ============================================================================
// LIKES
// ============================================================================
router.post('/posts/:postId/like', toggleLike);
router.get('/posts/:postId/likes', getPostLikes);

// ============================================================================
// COMMENTS
// ============================================================================
router.post('/posts/:postId/comments', addComment);
router.get('/posts/:postId/comments', getPostComments);
router.get('/comments/:commentId/replies', getCommentReplies);
router.delete('/comments/:commentId', deleteComment);
router.post('/comments/:commentId/like', toggleCommentLike);

// ============================================================================
// BOOKMARKS
// ============================================================================
router.post('/posts/:postId/bookmark', toggleBookmark);
router.get('/bookmarks', getUserBookmarks);

// ============================================================================
// SHARES
// ============================================================================
router.post('/posts/:postId/share', recordShare);

export default router;
