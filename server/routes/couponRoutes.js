import express from 'express';
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getAvailableCoupons,
} from '../controllers/couponController.js';

import adminProtect from '../middlewares/adminProtect.js';
import protect from '../middlewares/userProtect.js';

const router = express.Router();

// admin routes

router.post('/', adminProtect, createCoupon);
router.get('/admin', adminProtect, getAllCoupons);
router.get('/admin/check-code', adminProtect, (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ success: false, message: 'Code is required' });
  }
  
  const coupon = req.coupon;
  if (coupon && coupon.code === code) {
    return res.json({ success: true });
  }

  Coupon.findOne({ code })
    .then(result => {
      if (result) {
        return res.json({ success: false, message: 'Coupon code already exists' });
      }
      return res.json({ success: true });
    })
    .catch(error => {
      console.error('Error checking coupon code:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    });
});
router.route('/:id')
  .get(adminProtect, getCouponById)
  .put(adminProtect, updateCoupon)
  .delete(adminProtect, deleteCoupon);

// user routes
router.post('/validate', protect, validateCoupon);
router.get('/available', protect, getAvailableCoupons);

export default router;
