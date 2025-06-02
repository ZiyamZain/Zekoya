import express from "express";
const router = express.Router();
import {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon
} from '../controllers/couponController.js';

import adminProtect from '../middlewares/adminProtect.js';

// Admin coupon routes with multiple paths to support both old and new frontend calls
router.post('/', adminProtect, createCoupon);
router.post('/create', adminProtect, createCoupon);

router.get('/', adminProtect, getAllCoupons);
router.get('/all', adminProtect, getAllCoupons);

router.get('/:id', adminProtect, getCouponById);
router.get('/:id/details', adminProtect, getCouponById);

router.put('/:id', adminProtect, updateCoupon);
router.put('/:id/update', adminProtect, updateCoupon);

router.delete('/:id', adminProtect, deleteCoupon);
router.delete('/:id/delete', adminProtect, deleteCoupon);

export default router;
