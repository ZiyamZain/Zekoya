import express from 'express';
import { getSalesReport, getDashboardStats, exportSalesReportExcel, downloadExcelReport } from '../controllers/reportController.js';
import protectAdmin from '../middlewares/authMiddleware.js';

const router = express.Router();

// Admin routes
router.get('/sales', protectAdmin, getSalesReport);
router.get('/dashboard', protectAdmin, getDashboardStats);

// Dedicated routes for Excel exports
router.post('/excel', protectAdmin, exportSalesReportExcel);
router.get('/download-excel', protectAdmin, downloadExcelReport);

export default router;
