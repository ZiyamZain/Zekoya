import express from 'express';
import adminProtect from '../middlewares/adminProtect.js';
import { 
  getSalesReport,
  getDashboardStats,
  getBestSellers,
  getPaymentStats
} from '../controllers/reportController.js';

const router = express.Router();

router.get('/sales', adminProtect, getSalesReport);
router.get('/dashboard', adminProtect, getDashboardStats);
router.get('/bestsellers', adminProtect, getBestSellers);
router.get('/payment-stats', adminProtect, getPaymentStats);
router.get('/download', adminProtect, getSalesReport);

export default router;
