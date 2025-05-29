import express from 'express';
import protectAdmin from '../middlewares/authMiddleware.js';
import { 
  getSalesReport,
  getDashboardStats,
  getBestSellers,
  getPaymentStats
} from '../controllers/reportController.js';

const router = express.Router();

// Admin routes
router.get('/sales', protectAdmin, getSalesReport);
router.get('/dashboard', protectAdmin, getDashboardStats);
router.get('/bestsellers', protectAdmin, getBestSellers);
router.get('/payment-stats', protectAdmin, getPaymentStats);
router.get('/download', protectAdmin, getSalesReport);

export default router;
