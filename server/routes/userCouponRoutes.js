import express from 'express';
import {
  validateCoupon,
  getAvailableCoupons,
} from '../controllers/couponController.js';

import protect from '../middlewares/userProtect.js';

const router = express.Router();

router.post('/validate', protect, validateCoupon);
router.get('/available', protect, getAvailableCoupons);

export default router;
