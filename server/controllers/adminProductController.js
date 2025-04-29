import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import asyncHandler from "express-async-handler";
import path from "path";


export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isListed: true })
    .select('name _id')
    .sort({ name: 1 });
  res.json(categories);
});



export const addProduct = asyncHandler(async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    const name = req.body.name;
    const description = req.body.description;
    const price = req.body.price;
    const category = req.body.category;
    const sizes = req.body.sizes;
    

 
    if (!name || !description || !price || !category || !sizes) {
      res.status(400);
      throw new Error("Please fill in all required fields");
    }

    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      res.status(400);
      throw new Error("Category not found");
    }

    // Handle image paths from multer
    const images = req.files ? req.files.map(file => {
  
      const filename = path.basename(file.path);
      return `/uploads/${filename}`;
    }) : [];
    let parsedSizes;
  
    try {
      parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
    } catch (error) {
      console.error("Error parsing JSON:", error);
      res.status(400);
      throw new Error("Invalid sizes or specifications format");
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      sizes: parsedSizes,
      images,
    });

    if (product) {
      res.status(201).json({
        _id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        sizes: product.sizes,
        images: product.images,
      });
    } else {
      res.status(400);
      throw new Error("Invalid product data");
    }
  } catch (error) {
    console.error("Error in addProduct:", error);
    res.status(500).json({
      message: error.message || "Failed to add product",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;
  const search = req.query.search || "";

  const query = {
    $or: [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ],
  };

  try {
    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("category", "name")
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
    console.error("Error in getProducts:", error);
    res.status(500).json({
      message: error.message || "Failed to fetch products",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const {
    name,
    description,
    price,
    category,
    sizes,
    specifications,
  } = req.body;

  product.name = name || product.name;
  product.description = description || product.description;
  product.price = price || product.price;
  product.category = category || product.category;
  product.sizes = sizes ? JSON.parse(sizes) : product.sizes;
  product.specifications = specifications
    ? JSON.parse(specifications)
    : product.specifications;


  if (req.files && req.files.length > 0) {
    const newImageUrls = req.files.map(file => {
      const filename = path.basename(file.path);
      return `/uploads/${filename}`;
    });
    product.images = [...product.images, ...newImageUrls];
  }

  const updatedProduct = await product.save();
  res.json(updatedProduct);
});


export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.isListed = false;
  await product.save();

  res.json({ message: "Product deleted successfully" });
});


export const toggleProductListing = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.isListed = !product.isListed;
  await product.save();

  res.json(product);
});

export const toggleProductFeatured = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.isFeatured = !product.isFeatured;
  await product.save();

  res.json(product);
});


export const getFeaturedProducts = asyncHandler(async (req, res) => {
  console.log('Fetching featured products...');
  
  const products = await Product.find({ isFeatured: true, isListed: true })
    .populate("category", "name")
    .sort({ createdAt: -1 });

  console.log('Found featured products:', products.length);
  console.log('Sample product data:', products[0]);

  res.json(products);
});