import express from 'express';
import {
  getAllCategoriesAdmin,
  addCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryListing,
} from '../controllers/adminCategoryController.js';
import {
  getListedCategoriesUser,
  getCategoryByIdUser,
} from '../controllers/userCategoryController.js';
import adminProtect from '../middlewares/adminProtect.js';
import { createCloudinaryUploader, handleUploadError } from '../middlewares/cloudinaryUpload.js';

const router = express.Router();

// Create a specific uploader for category images
const categoryUploader = createCloudinaryUploader({
  folder: "zekoya/categories",
  transformation: [
    {
      width: 1500,
      height: 1500,
      crop: "limit",
      quality: 100,
      fetch_format: "auto",
    },
  ],
});

// Public user routes
router.get('/', getListedCategoriesUser);

// Admin GET route for all categories (must be before general /:id for users if paths could conflict without distinct mounting)
router.get('/all-admin', adminProtect, getAllCategoriesAdmin); // Admin route to get all categories (listed and unlisted)

// Public user route for single category (must be after specific admin GETs if paths could overlap without distinct mounting)
router.get('/:id', getCategoryByIdUser); // For fetching a single category details by user

router.post('/', adminProtect, categoryUploader.single('image'), addCategory);
router.put('/:id', adminProtect, categoryUploader.single('image'), updateCategory);
router.delete('/:id', adminProtect, deleteCategory);
router.patch('/:id/toggle-listing', adminProtect, toggleCategoryListing);

export default router;
