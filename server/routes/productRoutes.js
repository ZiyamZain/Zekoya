import express from 'express';
import {
  getProducts,
  getProductsByCategory,
  getProductsByBrand,
  getProductById,
} from '../controllers/productController.js';

const router = express.Router();

// Get all products
router.get('/', getProducts);

// Get products by category
router.get('/category/:categoryName', getProductsByCategory);

// Get products by brand
router.get('/brand/:brandName', getProductsByBrand);

router.get('/:id', getProductById);

export default router;
