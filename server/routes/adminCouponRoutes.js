import express from "express";
const router = express.Router();
import {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon
} from '../controllers/couponController.js';

import protectAdmin from '../middlewares/authMiddleware.js';

// Admin coupon routes with multiple paths to support both old and new frontend calls
router.post('/', protectAdmin, createCoupon);
router.post('/create', protectAdmin, createCoupon);

router.get('/', protectAdmin, getAllCoupons);
router.get('/all', protectAdmin, getAllCoupons);

router.get('/:id', protectAdmin, getCouponById);
router.get('/:id/details', protectAdmin, getCouponById);

router.put('/:id', protectAdmin, updateCoupon);
router.put('/:id/update', protectAdmin, updateCoupon);

router.delete('/:id', protectAdmin, deleteCoupon);
router.delete('/:id/delete', protectAdmin, deleteCoupon);

export default router;
