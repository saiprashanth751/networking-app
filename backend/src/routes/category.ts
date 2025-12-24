import { Router } from 'express';
import { getCategories, getCategoryBySlug, getPostsByCategory } from '../controllers/category';

const router = Router();

// Get all categories
router.get('/', getCategories);

// Get category by slug
router.get('/:slug', getCategoryBySlug);

// Get posts by category
router.get('/:slug/posts', getPostsByCategory);

export default router;
