import asyncHandler from 'express-async-handler';
import Category from '../models/categoryModel.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get all categories for admin (includes unlisted)
// @route   GET /api/admin/categories
// @access  Private/Admin
export const getAllCategoriesAdmin = asyncHandler(async (req, res) => {
  const { search = '', page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;

  const query = {
    name: { $regex: search, $options: 'i' },
  };

  const total = await Category.countDocuments(query);
  const categories = await Category.find(query)
    .populate('productCount') // Assuming you still want this for admin
    .sort({ createdAt: -1 }) // Sort by creation date, newest first for admin
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  res.json({ categories, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

// @desc    Add a new category
// @route   POST /api/admin/categories
// @access  Private/Admin
export const addCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Image required & processing failed.');
  }

  const categoryExists = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (categoryExists) {
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (cleanupError) {
        console.error('Cleanup error after duplicate category:', cleanupError);
      }
    }
    res.status(400);
    throw new Error('Category already exists');
  }

  const category = await Category.create({
    name,
    description,
    image: {
      url: req.file.path,
      public_id: req.file.filename,
    },
  });

  if (category) {
    res.status(201).json(category);
  } else {
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (cleanupError) {
        console.error('Error cleaning up Cloudinary image after category creation failure:', cleanupError);
      }
    }
    res.status(400);
    throw new Error('Invalid category data');
  }
});

// @desc    Update a category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (cleanupError) {
        console.error(
          `Error cleaning up new Cloudinary image for non-existent category: ${
            cleanupError}`,
        );
      }
    }
    res.status(404);
    throw new Error('Category not found');
  }

  const { name, description } = req.body;
  if (!name || !description) {
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (cleanupError) {
        console.error('Error cleaning up Cloudinary image due to invalid update data:', cleanupError);
      }
    }
    res.status(400);
    throw new Error('Name and description are required');
  }

  const categoryWithSameName = await Category.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    _id: { $ne: req.params.id },
  });

  if (categoryWithSameName) {
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (cleanupError) {
        console.error('Error cleaning up Cloudinary image due to duplicate category name on update:', cleanupError);
      }
    }
    res.status(400);
    throw new Error('Category with this name already exists');
  }

  category.name = name;
  category.description = description;

  if (req.file && req.file.path && req.file.filename) {
    const oldImagePublicId = category.image?.public_id;

    category.image = {
      url: req.file.path,
      public_id: req.file.filename,
    };

    if (oldImagePublicId) {
      try {
        await cloudinary.uploader.destroy(oldImagePublicId);
      } catch (deleteError) {
        console.error(
          'Error deleting old Cloudinary image:',
          deleteError,
        );
      }
    }
  }

  const updatedCategory = await category.save();
  res.json(updatedCategory);
});

// @desc    Delete a category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  await category.populate('productCount'); 
  if (category.productCount > 0) {
    res.status(400);
    throw new Error('Cannot delete category. It is associated with products.');
  }

  if (category.image && category.image.public_id) {
    try {
      await cloudinary.uploader.destroy(category.image.public_id);
    } catch (error) {
      console.error('Error deleting category image from Cloudinary:', error);
    }
  }

  const deletedCategory = await Category.findByIdAndDelete(req.params.id);
  if (deletedCategory) {
    res.json({ message: 'Category deleted successfully', id: req.params.id });
  } else {
    res.status(404); // Should not happen if findById worked, but as a safeguard
    throw new Error('Category not found for deletion, or already deleted.');
  }
});

// @desc    Toggle category listing status
// @route   PATCH /api/admin/categories/:id/toggle
// @access  Private/Admin
export const toggleCategoryListing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  category.isListed = !category.isListed;
  await category.save();

  res.json({
    message: `Category ${category.isListed ? 'listed' : 'unlisted'} successfully`,
    category,
  });
});
