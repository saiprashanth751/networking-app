import { Router } from 'express';
import { getAllTags, searchTags, getTrendingTags, getPostsByTag } from '../controllers/tag';

const router = Router();

// Get all tags (for filter UI, etc.)
router.get('/', getAllTags);

// Search tags (autocomplete)
router.get('/search', searchTags);

// Get trending tags
router.get('/trending', getTrendingTags);

// Get posts by tag
router.get('/:slug/posts', getPostsByTag);

export default router;
