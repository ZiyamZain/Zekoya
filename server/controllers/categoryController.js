import Category from "../models/categoryModel.js";
import asyncHandler from "express-async-handler";

export const getCategories = asyncHandler(async (req, res) => {
  const { search = "", page = 1, limit = 5, admin = false } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 5;

  const isAdmin = req.originalUrl.includes('/admin') || admin === 'true';
  
  // For admin, show all categories; for users, only show listed categories
  const query = {
    ...(isAdmin ? {} : { isListed: true }),
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


export const addCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    
    if (!name || !description) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  
  if (!image) {
    res.status(400);
    throw new Error("Category image is required");
    }

  const categoryExists = await Category.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
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


export const updateCategory = asyncHandler(async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404);
      throw new Error("Category not found");
    }

    const { name, description } = req.body;
    if (!name || !description) {
      res.status(400);
      throw new Error("Name and description are required");
    }


    const image = req.file ? `/uploads/${req.file.filename}` : category.image;

    // Check if another category with the same name already exists (case-insensitive)
    const categoryWithSameName = await Category.findOne({
      name: { $regex: new RegExp('^' + name + '$', 'i') },
      _id: { $ne: req.params.id } // Exclude the current category
    });
    
    if (categoryWithSameName) {
      res.status(400);
      throw new Error("Category with this name already exists");
    }
    
    category.name = name;
    category.description = description;
    category.image = image;
    const updatedCategory = await category.save();
  
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(error.status || 500);
    throw error;
  }
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  await Category.findByIdAndDelete(req.params.id);

  res.json({ message: "Category deleted successfully" });
});


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
