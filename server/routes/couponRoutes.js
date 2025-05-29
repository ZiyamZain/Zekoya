import express from "express";
const router = express.Router();
import {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
    getAvailableCoupons
} from '../controllers/couponController.js';

import protectAdmin from '../middlewares/authMiddleware.js';
import protect from '../middlewares/userProtect.js'


//admin routes

router.post('/',protectAdmin , createCoupon);
router.get('/admin',protectAdmin,getAllCoupons);
router.route('/:id')
    .get(protectAdmin,getCouponById)
    .put(protectAdmin,updateCoupon)
    .delete(protectAdmin , deleteCoupon)


//user routes 
router.post('/validate', protect, validateCoupon);
router.get('/available', protect, getAvailableCoupons);

export default router;