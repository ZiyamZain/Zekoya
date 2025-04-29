import express from "express";
import {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  toggleCategoryListing,
} from "../controllers/categoryController.js";
import protectAdmin from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();


router.get("/", getCategories);

// Admin routes
router.post("/", protectAdmin, upload.single('image'), addCategory);
router.put("/:id", protectAdmin, upload.single('image'), updateCategory);
router.delete("/:id", protectAdmin, deleteCategory);
router.patch("/:id/toggle-listing", protectAdmin, toggleCategoryListing);

export default router;
