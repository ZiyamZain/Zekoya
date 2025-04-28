import Product from "../models/productModel.js";
import asyncHandler from "express-async-handler";
import Category from "../models/categoryModel.js";

// @desc    Get all products (paginated & searchable)
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const { search = "", page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;

  // Build search query (search by name or description)
  const query = {
    isListed: true,
    $or: [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ]
  };

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate("category", "name")
    .populate("brand", "name")
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  res.json({ products, total });
});

// @desc    Get products by category (paginated)
// @route   GET /api/products/category/:categoryName
// @access  Public
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryName } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  console.log('Received category name:', categoryName);
  const decodedCategoryName = decodeURIComponent(categoryName).trim();
  console.log('Decoded category name:', decodedCategoryName);

  try {
    // Find the category in a case-insensitive way
    const category = await Category.findOne({ name: { $regex: `^${decodedCategoryName}$`, $options: 'i' } });
    console.log('Found category:', category);

    if (!category) {
      console.log('Category not found');
      return res.status(404).json({ message: 'Category not found', products: [], total: 0 });
    }

    // Find products with this category (paginated)
    const query = { isListed: true, category: category._id };
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    console.log('Found products:', products.length);
    res.json({ products, total });
  } catch (error) {
    console.error('Error in getProductsByCategory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const product = await Product.findById(id)
      .populate("category", "name");
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get products by brand
// @route   GET /api/products/brand/:brandName
// @access  Public
export const getProductsByBrand = asyncHandler(async (req, res) => {
  const { brandName } = req.params;

  const products = await Product.find({ 
    isListed: true,
    'brand.name': brandName 
  })
    .populate("category", "name")
    .populate("brand", "name")
    .sort({ createdAt: -1 });

  res.json(products);
}); 