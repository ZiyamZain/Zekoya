import express from 'express';
import {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  toggleProductListing,
  getCategories,
  toggleProductFeatured,
  getFeaturedProducts,
} from '../controllers/adminProductController.js';
import adminProtect from '../middlewares/adminProtect.js';
import { createCloudinaryUploader } from '../middlewares/cloudinaryUpload.js';

const router = express.Router();

// Create a specific uploader for product images
const productUploader = createCloudinaryUploader({
  folder: 'zekoya/products',
  transformation: [
    {
      width: 1500, height: 1500, crop: 'limit', quality: 100, fetch_format: 'auto',
    },
  ],
});

router.get('/categories', adminProtect, getCategories);

router.get('/featured', getFeaturedProducts);

router.get('/', adminProtect, getProducts);

// Add new product
router.post(
  '/add',
  adminProtect,
  productUploader.array('images', 5),
  addProduct,
);

// Update product
router.put(
  '/:id',
  adminProtect,
  productUploader.array('newImages', 5),
  updateProduct,
);

router.delete('/:id', adminProtect, deleteProduct); // Corrected delete route path

router.patch('/:id/toggle-listing', adminProtect, toggleProductListing);

router.patch('/:id/toggle-featured', adminProtect, toggleProductFeatured);

export default router;
