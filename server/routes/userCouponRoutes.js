import express from "express";
const router = express.Router();
import {
    validateCoupon,
    getAvailableCoupons
} from '../controllers/couponController.js';

import protect from '../middlewares/userProtect.js';

router.post('/validate', protect, validateCoupon);
router.get('/available', protect, getAvailableCoupons);

export default router;
