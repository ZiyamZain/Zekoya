import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose'; // Added for ObjectId validation
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';

export const getProducts = asyncHandler(async (req, res) => {
  const { search = '', page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;

  const query = {
    isListed: true,
    $or: [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ],
  };

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  res.json({ products, total });
});

export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryName } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const decodedCategoryName = decodeURIComponent(categoryName).trim();

  try {
    const category = await Category.findOne({ name: { $regex: `^${decodedCategoryName}$`, $options: 'i' } });

    if (!category) {
      return res.status(404).json({ message: 'Category not found', products: [], total: 0 });
    }

    const query = { isListed: true, category: category._id };
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({ products, total });
  } catch (error) {
    console.error('Error in getProductsByCategory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid product ID format' });
  }

  try {
    const product = await Product.findById(id)
      .populate('category', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export const getProductsByBrand = asyncHandler(async (req, res) => {
  const { brandName } = req.params;

  const products = await Product.find({
    isListed: true,
    'brand.name': brandName,
  })
    .populate('category', 'name')
    .populate('brand', 'name')
    .sort({ createdAt: -1 });

  res.json(products);
});
