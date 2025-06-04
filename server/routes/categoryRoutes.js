import express from "express";
import {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  toggleCategoryListing,
} from "../controllers/categoryController.js";
import adminProtect from "../middlewares/adminProtect.js";
import { createCloudinaryUploader, handleUploadError } from "../middlewares/cloudinaryUpload.js";

const router = express.Router();

// Create a specific uploader for category images
const categoryUploader = createCloudinaryUploader({
  folder: 'zekoya/categories',
  transformation: [
    { width: 500, height: 500, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' }
  ]
});

router.get("/", getCategories);

// Admin routes
router.post("/", adminProtect, categoryUploader.single('image'), handleUploadError, addCategory);
router.put("/:id", adminProtect, categoryUploader.single('image'), handleUploadError, updateCategory);
router.delete("/:id", adminProtect, deleteCategory);
router.patch("/:id/toggle-listing", adminProtect, toggleCategoryListing);

export default router;
