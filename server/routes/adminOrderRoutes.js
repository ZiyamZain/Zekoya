import express from "express";
import protectAdmin from "../middlewares/authMiddleware.js";
import {
  getAllOrders,
  updateOrderStatus,
  processReturnRequest,
  getOrderById,
  generateInvoice,
} from "../controllers/adminOrderController.js";

const router = express.Router();

// Admin-only routes
router.get("/", protectAdmin, getAllOrders);
router.get("/:id", protectAdmin, getOrderById);
router.put("/:orderId/status", protectAdmin, updateOrderStatus);
router.put("/:orderId/items/:itemId/return", protectAdmin, processReturnRequest);
router.get("/:orderId/invoice", protectAdmin, generateInvoice);

export default router;
