import express from "express";
import {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  toggleProductListing,
  getCategories,
  toggleProductFeatured,
  getFeaturedProducts,
} from "../controllers/adminProductController.js";
import protectAdmin from "../middlewares/authMiddleware.js";
import upload, { handleUploadError } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Get all categories
router.get("/categories", protectAdmin, getCategories);

// Get featured products
router.get("/featured", getFeaturedProducts);


// Get all products
router.get("/", protectAdmin, getProducts);

// Add new product
router.post(
  "/add",
  protectAdmin,
  upload.array("images", 5),
  handleUploadError,
  addProduct
);

// Update product
router.put(
  "/:id",
  protectAdmin,
  upload.array("images", 5),
  handleUploadError,
  updateProduct
);

// Delete product (soft delete)
router.patch("/delete/:id", protectAdmin, deleteProduct);

// Toggle product listing status
router.patch("/:id/toggle-listing", protectAdmin, toggleProductListing);

// Toggle product featured status
router.patch("/:id/toggle-featured", protectAdmin, toggleProductFeatured);

export default router;

