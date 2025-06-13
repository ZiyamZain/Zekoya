import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';
import cloudinary from '../config/cloudinary.js';

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isListed: true })
    .select('name _id')
    .sort({ name: 1 });
  res.json(categories);
});

export const addProduct = asyncHandler(async (req, res) => {
  const {
    name, description, price, category, sizes, specifications,
  } = req.body;
  let uploadedImagesData = [];

  try {
    if (!name || !description || !price || !category || !sizes) {
      if (req.files && req.files.length > 0) {
        uploadedImagesData = req.files.map((f) => ({ public_id: f.filename }));
        await deleteImagesFromCloudinary(uploadedImagesData);
      }
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (name, description, price, category, sizes)',
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      if (req.files && req.files.length > 0) {
        uploadedImagesData = req.files.map((f) => ({ public_id: f.filename }));
        await deleteImagesFromCloudinary(uploadedImagesData);
      }
      return res.status(400).json({ success: false, message: 'Category not found' });
    }

    if (!req.files || req.files.length < 3) {
      if (req.files && req.files.length > 0) {
        uploadedImagesData = req.files.map((f) => ({ public_id: f.filename }));
        await deleteImagesFromCloudinary(uploadedImagesData);
      }
      return res.status(400).json({
        success: false,
        message: 'At least 3 product images are required.',
      });
    }
    uploadedImagesData = req.files.map((file) => ({
      url: file.path, // URL from Cloudinary
      public_id: file.filename, // public_id from Cloudinary (filename from storage engine)
    }));

    let parsedSizes;
    try {
      parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      if (!Array.isArray(parsedSizes) || parsedSizes.length === 0) {
        throw new Error('Sizes must be a non-empty array.');
      }
    } catch (error) {
      await deleteImagesFromCloudinary(uploadedImagesData);
      return res.status(400).json({ success: false, message: `Invalid sizes format: ${error.message}` });
    }

    let parsedSpecifications;
    if (specifications) {
      try {
        parsedSpecifications = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      } catch (error) {
        await deleteImagesFromCloudinary(uploadedImagesData);
        return res.status(400).json({ success: false, message: `Invalid specifications format: ${error.message}` });
      }
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      sizes: parsedSizes,
      images: uploadedImagesData,
      specifications: parsedSpecifications,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Error in addProduct:', error);

    if (uploadedImagesData.length > 0) {
      const productExists = await Product.findOne({ 'images.public_id': { $in: uploadedImagesData.map((img) => img.public_id) } });
      if (!productExists) {
        await deleteImagesFromCloudinary(uploadedImagesData);
      }
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add product',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

export const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 5;
  const page = Number(req.query.page) || 1;
  const search = req.query.search || '';

  const query = {
    $or: [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ],
  };

  try {
    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    console.error('Error in getProducts:', error);
    res.status(500).json({
      message: error.message || 'Failed to fetch products',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name, description, price, category, sizes, specifications, imagesToDelete,
  } = req.body;
  let newUploadedImagesData = [];

  try {
    const product = await Product.findById(id);
    if (!product) {
      // If new files were uploaded for a product that doesn't exist, clean them up.
      if (req.files && req.files.length > 0) {
        newUploadedImagesData = req.files.map((f) => ({ public_id: f.filename }));
        await deleteImagesFromCloudinary(newUploadedImagesData);
      }
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Update text fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = Number(price);
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        if (req.files && req.files.length > 0) {
          newUploadedImagesData = req.files.map((f) => ({ public_id: f.filename }));
          await deleteImagesFromCloudinary(newUploadedImagesData);
        }
        return res.status(400).json({ success: false, message: 'Category not found' });
      }
      product.category = category;
    }

    if (sizes) {
      try {
        const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
        if (!Array.isArray(parsedSizes)) throw new Error('Sizes must be an array.');
        product.sizes = parsedSizes;
      } catch (error) {
        if (req.files && req.files.length > 0) {
          newUploadedImagesData = req.files.map((f) => ({ public_id: f.filename }));
          await deleteImagesFromCloudinary(newUploadedImagesData);
        }
        return res.status(400).json({ success: false, message: `Invalid sizes format: ${error.message}` });
      }
    }

    if (specifications) {
      try {
        const parsedSpecifications = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
        product.specifications = parsedSpecifications;
      } catch (error) {
        if (req.files && req.files.length > 0) {
          newUploadedImagesData = req.files.map((f) => ({ public_id: f.filename }));
          await deleteImagesFromCloudinary(newUploadedImagesData);
        }
        return res.status(400).json({ success: false, message: `Invalid specifications format: ${error.message}` });
      }
    }

    // Log existing images from DB
    console.log('Existing product.images from DB:', JSON.stringify(product.images, null, 2));
    let currentImages = [...product.images];

    // 1. Delete images marked for deletion
    if (imagesToDelete) {
      let parsedImagesToDelete = [];
      try {
        parsedImagesToDelete = typeof imagesToDelete === 'string' ? JSON.parse(imagesToDelete) : imagesToDelete;
        if (!Array.isArray(parsedImagesToDelete)) throw new Error('imagesToDelete must be an array of public_ids');
      } catch (error) {
        // Log error, but don't necessarily fail the whole update if new images are also being added.
        console.error('Error parsing imagesToDelete:', error.message);
        // Potentially return an error if this is critical
        // return res.status(400).json({ success: false, message: `Invalid imagesToDelete format: ${error.message}` });
      }

      if (parsedImagesToDelete.length > 0) {
        const imagesToDeleteFromCloudinary = currentImages.filter((img) => parsedImagesToDelete.includes(img.public_id));
        if (imagesToDeleteFromCloudinary.length > 0) {
          await deleteImagesFromCloudinary(imagesToDeleteFromCloudinary);
        }
        currentImages = currentImages.filter((img) => !parsedImagesToDelete.includes(img.public_id));
      }
    }

    if (req.files && req.files.length > 0) {
      newUploadedImagesData = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
      currentImages.push(...newUploadedImagesData);
    }

    // Validate minimum number of images after updates
    if (currentImages.length < 3) {
      // If new images were uploaded, but total is still less than 3, clean them up.
      if (newUploadedImagesData.length > 0) {
        await deleteImagesFromCloudinary(newUploadedImagesData);
      }
      return res.status(400).json({
        success: false,
        message: 'Product must have at least 3 images after update.',
      });
    }

    // Log currentImages before attempting to save
    console.log('Final currentImages before save:', JSON.stringify(currentImages, null, 2));
    product.images = currentImages;

    const updatedProduct = await product.save();
    res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Error in updateProduct:', error);
    // Cleanup newly uploaded images if an error occurred during the update process
    if (newUploadedImagesData.length > 0) {
      await deleteImagesFromCloudinary(newUploadedImagesData);
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update product',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

// Helper function to delete images from Cloudinary by public_id array
const deleteImagesFromCloudinary = async (images) => {
  if (!images || images.length === 0) {
    console.log('[deleteImagesFromCloudinary] No images provided to delete.');
    return;
  }
  const publicIds = images.map((image) => image.public_id).filter((pid) => pid);

  if (publicIds.length === 0) {
    console.log('[deleteImagesFromCloudinary] No valid public_ids found to delete.');
    return;
  }

  console.log(`[deleteImagesFromCloudinary] Attempting to delete ${publicIds.length} images from Cloudinary with public_ids:`, publicIds);

  try {
    const results = await Promise.all(
      publicIds.map((publicId) => cloudinary.uploader.destroy(publicId)),
    );
    console.log('[deleteImagesFromCloudinary] Cloudinary deletion API call results:', JSON.stringify(results, null, 2));

    results.forEach((result, index) => {
      if (result.result !== 'ok' && result.result !== 'not found') {
        console.warn(`[deleteImagesFromCloudinary] Failed to delete image ${publicIds[index]} from Cloudinary. Result: ${result.result}`);
      } else {
        console.log(`[deleteImagesFromCloudinary] Successfully deleted or confirmed not found for image ${publicIds[index]}. Result: ${result.result}`);
      }
    });
  } catch (error) {
    console.error('[deleteImagesFromCloudinary] Error during Cloudinary bulk deletion:', error);
    throw error;
  }
};

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(`[deleteProduct] Attempting to delete product with ID: ${id}`);

  try {
    const product = await Product.findById(id);

    if (!product) {
      console.log(`[deleteProduct] Product with ID: ${id} not found.`);
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    console.log(`[deleteProduct] Found product: ${product.name} (ID: ${id})`);

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      const publicIdsToDelete = product.images.map((image) => image.public_id).filter((pid) => pid);
      console.log(`[deleteProduct] Product has ${publicIdsToDelete.length} images with public_ids to delete from Cloudinary:`, publicIdsToDelete);

      if (publicIdsToDelete.length > 0) {
        try {
          console.log('[deleteProduct] Calling deleteImagesFromCloudinary helper...');
          await deleteImagesFromCloudinary(publicIdsToDelete.map((pid) => ({ public_id: pid })));
          console.log('[deleteProduct] Finished deleteImagesFromCloudinary helper call.');
        } catch (cloudinaryError) {
          console.error('[deleteProduct] Error deleting images from Cloudinary (error caught in deleteProduct):', cloudinaryError);
          // Decide if this error should prevent product deletion from DB
          // For now, logging and continuing, as per original logic
        }
      }
    } else {
      console.log(`[deleteProduct] Product with ID: ${id} has no images to delete from Cloudinary.`);
    }

    console.log(`[deleteProduct] Attempting to delete product with ID: ${id} from database...`);
    await Product.findByIdAndDelete(id);
    console.log(`[deleteProduct] Successfully deleted product with ID: ${id} from database.`);

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error(`[deleteProduct] Critical error during deletion of product ID: ${id}. Error:`, error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete product',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

export const toggleProductListing = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.isListed = !product.isListed;
  await product.save();

  res.json(product);
});

export const toggleProductFeatured = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.isFeatured = !product.isFeatured;
  await product.save();

  res.json(product);
});

export const getFeaturedProducts = asyncHandler(async (req, res) => {
  // Get all listed categories
  const listedCategories = await Category.find({ isListed: true }).select('_id');
  const listedCategoryIds = listedCategories.map((cat) => cat._id);

  // Find featured products that are listed AND belong to a listed category
  const products = await Product.find({
    isFeatured: true,
    isListed: true,
    category: { $in: listedCategoryIds }, // Only include products from listed categories
  })
    .populate('category', 'name isListed')
    .sort({ createdAt: -1 });

  res.json(products);
});
