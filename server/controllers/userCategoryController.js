import asyncHandler from 'express-async-handler';
import Category from '../models/categoryModel.js';

// @desc    Get listed categories for users
// @route   GET /api/categories
// @access  Public
export const getListedCategoriesUser = asyncHandler(async (req, res) => {
  const { search = '', page = 1, limit = 100 } = req.query; // Default high limit for users, can be adjusted or removed for no pagination
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 100;

  const query = {
    isListed: true, // Always fetch only listed categories for users
    name: { $regex: search, $options: 'i' },
  };

  const total = await Category.countDocuments(query);
  const categories = await Category.find(query)
    .populate('productCount') // Assuming you want this for users too
    .sort({ name: 1 }) // Sort alphabetically for user display
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  res.json({ categories, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

// @desc    Get a single listed category by ID for users
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryByIdUser = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, isListed: true })
                         .populate('productCount');

  if (category) {
    res.json(category);
  } else {
    res.status(404);
    throw new Error('Category not found or not available');
  }
});
