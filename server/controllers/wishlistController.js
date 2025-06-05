import Product from '../models/productModel.js';
import Wishlist from '../models/wishListModel.js';

export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate({
        path: 'products',
        select: 'name price images isListed sizes category',
        populate: {
          path: 'category',
          select: 'name isListed',
        },
      });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    // Filter out unlisted products or categories
    wishlist.products = wishlist.products.filter((product) => product
      && product.isListed
      && product.category
      && product.category.isListed);

    await wishlist.save();
    res.status(200).json(wishlist);
  } catch (error) {
    console.error('Error fetching wishlist', error);
    res.status(500).json({ message: 'Error fetching wishlist' });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const product = await Product.findById(productId).populate('category');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.isListed) {
      return res.status(400).json({ message: 'Product is not available' });
    }

    if (!product.category || !product.category.isListed) {
      return res
        .status(400)
        .json({ message: 'Product category is not available' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [],
      });
    }

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    await wishlist.populate({
      path: 'products',
      select: 'name price images isListed sizes category',
      populate: {
        path: 'category',
        select: 'name isListed',
      },
    });

    res.status(200).json(wishlist);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Failed to add item to wishlist' });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.products = wishlist.products.filter(
      (product) => product.toString() !== productId,
    );
    await wishlist.save();

    await wishlist.populate({
      path: 'products',
      select: 'name price images isListed sizes category',
      populate: {
        path: 'category',
        select: 'name isListed',
      },
    });

    res.status(200).json(wishlist);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Failed to remove item from wishlist' });
  }
};
