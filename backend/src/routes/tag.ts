import { Router } from 'express';
import { searchTags, getTrendingTags, getPostsByTag } from '../controllers/tag';

const router = Router();

// Search tags (autocomplete)
router.get('/search', searchTags);

// Get trending tags
router.get('/trending', getTrendingTags);

// Get posts by tag
router.get('/:slug/posts', getPostsByTag);

export default router;
