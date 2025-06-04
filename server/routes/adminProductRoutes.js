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
import adminProtect from "../middlewares/adminProtect.js";
import { createCloudinaryUploader, handleUploadError } from "../middlewares/cloudinaryUpload.js";

const router = express.Router();

// Create a specific uploader for product images
const productUploader = createCloudinaryUploader({
  folder: 'zekoya/products',
  transformation: [
    { width: 1000, height: 1000, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' }
  ]
});

router.get("/categories", adminProtect, getCategories);

router.get("/featured", getFeaturedProducts);

router.get("/", adminProtect, getProducts);

// Add new product
router.post(
  "/add",
  adminProtect,
  productUploader.array("images", 5),
  handleUploadError,
  addProduct
);

// Update product
router.put(
  "/:id",
  adminProtect,
  productUploader.array("newImages", 5),
  handleUploadError,
  updateProduct
);

router.delete("/:id", adminProtect, deleteProduct); // Corrected delete route path

router.patch("/:id/toggle-listing", adminProtect, toggleProductListing);

router.patch("/:id/toggle-featured", adminProtect, toggleProductFeatured);

export default router;
