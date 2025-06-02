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
import upload, { handleUploadError } from "../middlewares/uploadMiddleware.js";

const router = express.Router();


router.get("/categories", adminProtect, getCategories);


router.get("/featured", getFeaturedProducts);


router.get("/", adminProtect, getProducts);

// Add new product
router.post(
  "/add",
  adminProtect,
  upload.array("images", 5),
  handleUploadError,
  addProduct
);

// Update product
router.put(
  "/:id",
  adminProtect,
  upload.array("newImages", 5),
  handleUploadError,
  updateProduct
);


router.delete("/delete/:id", adminProtect, deleteProduct);


router.patch("/:id/toggle-listing", adminProtect, toggleProductListing);


router.patch("/:id/toggle-featured", adminProtect, toggleProductFeatured);

export default router;
