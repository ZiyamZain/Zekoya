import express from "express";
import {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  toggleCategoryListing,
} from "../controllers/categoryController.js";
import adminProtect from "../middlewares/adminProtect.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();


router.get("/", getCategories);

// Admin routes
router.post("/", adminProtect, upload.single('image'), addCategory);
router.put("/:id", adminProtect, upload.single('image'), updateCategory);
router.delete("/:id", adminProtect, deleteCategory);
router.patch("/:id/toggle-listing", adminProtect, toggleCategoryListing);

export default router;
