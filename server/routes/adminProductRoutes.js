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


router.get("/categories", protectAdmin, getCategories);


router.get("/featured", getFeaturedProducts);


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
  upload.array("newImages", 5),
  handleUploadError,
  updateProduct
);


router.delete("/delete/:id", protectAdmin, deleteProduct);


router.patch("/:id/toggle-listing", protectAdmin, toggleProductListing);


router.patch("/:id/toggle-featured", protectAdmin, toggleProductFeatured);

export default router;
