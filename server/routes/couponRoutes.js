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

import adminProtect from '../middlewares/adminProtect.js';
import protect from '../middlewares/userProtect.js'


//admin routes

router.post('/',adminProtect , createCoupon);
router.get('/admin',adminProtect,getAllCoupons);
router.route('/:id')
    .get(adminProtect,getCouponById)
    .put(adminProtect,updateCoupon)
    .delete(adminProtect , deleteCoupon)


//user routes 
router.post('/validate', protect, validateCoupon);
router.get('/available', protect, getAvailableCoupons);

export default router;