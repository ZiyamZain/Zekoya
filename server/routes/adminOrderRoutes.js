import express from 'express';
import adminProtect from '../middlewares/adminProtect.js';
import {
  getAllOrders,
  updateOrderStatus,
  processReturnRequest,
  getOrderById,
  generateInvoice,
} from '../controllers/adminOrderController.js';

const router = express.Router();

// Admin-only routes
router.get('/', adminProtect, getAllOrders);
router.get('/:id', adminProtect, getOrderById);
router.put('/:orderId/status', adminProtect, updateOrderStatus);
router.put('/:orderId/items/:itemId/return', adminProtect, processReturnRequest);
router.get('/:orderId/invoice', adminProtect, generateInvoice);

export default router;
