import Category from "../models/categoryModel.js";
import asyncHandler from "express-async-handler";

// @desc    Get all categories (paginated)
// @route   GET /api/categories or /api/admin/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const { search = "", page = 1, limit = 5 } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 5;

  const query = {
    isListed: true,
    name: { $regex: search, $options: "i" },
  };

  const total = await Category.countDocuments(query);
  const categories = await Category.find(query)
    .populate('productCount')
    .sort({ name: 1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  res.json({ categories, total });
});

// @desc    Add new category
// @route   POST /api/admin/categories
// @access  Private/Admin
export const addCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    
    if (!name || !description) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  // Get image path from multer
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  
  if (!image) {
    res.status(400);
    throw new Error("Category image is required");
    }

  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    res.status(400);
    throw new Error("Category already exists");
  }

  const category = await Category.create({
    name,
    description,
    image
  });

  if (category) {
    res.status(201).json(category);
  } else {
    res.status(400);
    throw new Error("Invalid category data");
  }
});

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404);
      throw new Error("Category not found");
    }

    const { name, description } = req.body;

    // Validate required fields
    if (!name || !description) {
      res.status(400);
      throw new Error("Name and description are required");
    }

    // Update image only if new file is uploaded
    const image = req.file ? `/uploads/${req.file.filename}` : category.image;

    category.name = name;
    category.description = description;
    category.image = image;

    const updatedCategory = await category.save();
    console.log('Category updated:', updatedCategory);
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(error.status || 500);
    throw error;
  }
});

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  category.isListed = false;
  await category.save();

  res.json({ message: "Category deleted successfully" });
});

// Toggle Category Listing Status
export const toggleCategoryListing = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.isListed = !category.isListed;
    await category.save();

    res.status(200).json({ 
      message: `Category ${category.isListed ? 'listed' : 'unlisted'} successfully`,
      category 
    });
  } catch (err) {
    console.error("Error toggling category listing:", err);
    res.status(500).json({ message: err.message });
  }
};
