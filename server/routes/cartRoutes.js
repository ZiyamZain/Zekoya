import express from "express";
import protect from "../middlewares/userProtect.js";
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
} from "../controllers/cartController.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getCart)
  .post(protect, addToCart)
  .put(protect, updateCartItemQuantity);

router.route("/:itemId").delete(protect, removeFromCart);

export default router;
