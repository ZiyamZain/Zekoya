import express from 'express';
import { getAllReviews, getProductReviews, submitReview } from '../controllers/reviewController.js';
import protect from '../middlewares/userProtect.js';

const router = express.Router();

// GET /api/reviews - Get all reviews (admin only)
router.get('/', getAllReviews);

// GET /api/reviews/:productId - Get reviews for a specific product
router.get('/:productId', getProductReviews);

// POST /api/reviews - Submit a new review (protected route)
router.post('/', protect, submitReview);

export default router;
