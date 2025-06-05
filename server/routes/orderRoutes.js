import express from 'express';
import protect from '../middlewares/userProtect.js';

import {
  createOrder,
  getOrderById,
  getMyOrders,
  cancelOrderItem,
  cancelOrder,
  requestReturnItem,
  generateInvoice,

} from '../controllers/orderController.js';

const router = express.Router();
router.route('/').post(protect, createOrder).get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.post('/:orderId/cancel', protect, cancelOrder);
router.post('/:orderId/items/:itemId/cancel', protect, cancelOrderItem);
router.post('/:orderId/items/:itemId/return', protect, requestReturnItem);
router.get('/:orderId/invoice', protect, generateInvoice);

export default router;
