import Category from "../models/categoryModel.js";
import asyncHandler from "express-async-handler";
import cloudinary from "../config/cloudinary.js";

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
  
  // The cloudinaryUpload middleware (categoryUploader.single('image')) already handles the upload.
  // If req.file doesn't exist here, it means handleUploadError middleware caught an issue or no file was sent.
  if (!req.file) { 
    res.status(400);
    // This error might be redundant if handleUploadError already sent a response.
    // However, it's a safeguard if a file is expected but not processed by middleware for some reason.
    throw new Error("Category image is required and processing failed.");
  }

  const categoryExists = await Category.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
  if (categoryExists) {
    // If category exists, and an image was uploaded by middleware, we should delete it from Cloudinary
    if (req.file && req.file.filename) { // req.file.filename is public_id
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (cleanupError) {
        console.error("Error cleaning up Cloudinary image after duplicate category attempt:", cleanupError);
      }
    }
    res.status(400);
    throw new Error("Category already exists");
  }

  // Directly use properties from req.file provided by Cloudinary middleware
  // req.file.path is the Cloudinary URL, req.file.filename is the public_id
  const category = await Category.create({
    name,
    description,
    image: {
      url: req.file.path,       // Use Cloudinary URL from middleware
      public_id: req.file.filename, // Use Cloudinary public_id from middleware
    },
  });

  if (category) {
    res.status(201).json(category);
  } else {
    // If category creation fails after image upload, delete the image from Cloudinary
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (cleanupError) {
        console.error("Error cleaning up Cloudinary image after category creation failure:", cleanupError);
      }
    }
    res.status(400);
    throw new Error("Invalid category data");
  }
  // The broad try-catch for manual upload is no longer needed here as middleware handles it.
  // Error handling for DB operations is covered by asyncHandler.
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    // If a new image was uploaded by middleware but category not found, delete it.
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (cleanupError) {
        console.error("Error cleaning up Cloudinary image for non-existent category update:", cleanupError);
      }
    }
    res.status(404);
    throw new Error("Category not found");
  }

  const { name, description } = req.body;
  if (!name || !description) {
    // If validation fails after a new image was uploaded, delete the new image.
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (cleanupError) {
        console.error("Error cleaning up Cloudinary image due to invalid update data:", cleanupError);
      }
    }
    res.status(400);
    throw new Error("Name and description are required");
  }

  const categoryWithSameName = await Category.findOne({
    name: { $regex: new RegExp('^' + name + '$', 'i') },
    _id: { $ne: req.params.id } 
  });
  
  if (categoryWithSameName) {
    // If validation fails after a new image was uploaded, delete the new image.
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (cleanupError) {
        console.error("Error cleaning up Cloudinary image due to duplicate category name on update:", cleanupError);
      }
    }
    res.status(400);
    throw new Error("Category with this name already exists");
  }
  
  category.name = name;
  category.description = description;

  // If a new image was uploaded (req.file exists)
  if (req.file && req.file.path && req.file.filename) {
    const oldImagePublicId = category.image?.public_id;

    // Update category document with new image details from middleware
    category.image = {
      url: req.file.path,
      public_id: req.file.filename,
    };

    // If there was an old image, delete it from Cloudinary
    if (oldImagePublicId) {
      try {
        await cloudinary.uploader.destroy(oldImagePublicId);
      } catch (deleteError) {
        console.error('Error deleting old category image from Cloudinary:', deleteError);
        // Decide if this should be a critical error. For now, we'll log and continue, 
        // as the main goal is to update with the new image.
      }
    }
  } 
  // If no new image (req.file is null), category.image remains unchanged unless explicitly cleared by frontend logic (not current case)
  
  const updatedCategory = await category.save();
  
  res.json(updatedCategory);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  if (category.image && category.image.public_id) {
    try {
      await cloudinary.uploader.destroy(category.image.public_id);
    } catch (error) {
      console.error("Error deleting category image from Cloudinary:", error);
    }
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
