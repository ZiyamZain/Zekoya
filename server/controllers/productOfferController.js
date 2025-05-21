import ProductOffer from '../models/productOfferModel.js';
import Product from '../models/productModel.js';


// Get all product offers
export const getAllProductOffers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const offers = await ProductOffer.find()
      .populate('product', 'name images price')
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await ProductOffer.countDocuments();
    
    res.status(200).json({
      offers,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Error fetching product offers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get product offer by ID
export const getProductOfferById = async (req, res) => {
  try {
    const offer = await ProductOffer.findById(req.params.id)
      .populate('product', 'name images price')
      .populate('createdBy', 'email');
    
    if (!offer) {
      return res.status(404).json({ message: 'Product offer not found' });
    }
    
    res.status(200).json(offer);
  } catch (error) {
    console.error('Error fetching product offer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new product offer
export const createProductOffer = async (req, res) => {
  try {
    const { product, discountType, discountValue, startDate, endDate, description, isActive } = req.body;
    
    // Validate product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if an active offer already exists for this product
    const existingOffer = await ProductOffer.findOne({
      product,
      isActive: true,
      $or: [
        // New offer starts during existing offer
        {
          startDate: { $lte: new Date(startDate) },
          endDate: { $gte: new Date(startDate) }
        },
        // New offer ends during existing offer
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(endDate) }
        },
        // New offer completely encompasses existing offer
        {
          startDate: { $gte: new Date(startDate) },
          endDate: { $lte: new Date(endDate) }
        }
      ]
    });
    
    if (existingOffer) {
      return res.status(400).json({ 
        message: 'An active offer already exists for this product during the specified date range' 
      });
    }
    
    // Create new offer
    // Extract name from request body or generate a default name based on product
    const name = req.body.name || `Offer for product ${product}`;
    
    const newOffer = new ProductOffer({
      product,
      name, // Add the name field
      discountType,
      discountValue,
      startDate,
      endDate,
      description,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.admin._id
    });
    
    const savedOffer = await newOffer.save();
    
    res.status(201).json(savedOffer);
  } catch (error) {
    console.error('Error creating product offer:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a product offer
export const updateProductOffer = async (req, res) => {
  try {
    const { product, discountType, discountValue, startDate, endDate, description, isActive } = req.body;
    
    const offer = await ProductOffer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Product offer not found' });
    }
    
    // If product is being changed, validate it exists
    if (product && product !== offer.product.toString()) {
      const productExists = await Product.findById(product);
      if (!productExists) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Check if an active offer already exists for the new product
      const existingOffer = await ProductOffer.findOne({
        _id: { $ne: req.params.id },
        product,
        isActive: true,
        $or: [
          // New offer starts during existing offer
          {
            startDate: { $lte: new Date(startDate || offer.startDate) },
            endDate: { $gte: new Date(startDate || offer.startDate) }
          },
          // New offer ends during existing offer
          {
            startDate: { $lte: new Date(endDate || offer.endDate) },
            endDate: { $gte: new Date(endDate || offer.endDate) }
          },
          // New offer completely encompasses existing offer
          {
            startDate: { $gte: new Date(startDate || offer.startDate) },
            endDate: { $lte: new Date(endDate || offer.endDate) }
          }
        ]
      });
      
      if (existingOffer) {
        return res.status(400).json({ 
          message: 'An active offer already exists for this product during the specified date range' 
        });
      }
    }
    
    // Update offer fields
    if (product) offer.product = product;
    if (discountType) offer.discountType = discountType;
    if (discountValue !== undefined) offer.discountValue = discountValue;
    if (startDate) offer.startDate = startDate;
    if (endDate) offer.endDate = endDate;
    if (description) offer.description = description;
    if (isActive !== undefined) offer.isActive = isActive;
    
    const updatedOffer = await offer.save();
    
    res.status(200).json(updatedOffer);
  } catch (error) {
    console.error('Error updating product offer:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a product offer
export const deleteProductOffer = async (req, res) => {
  try {
    const offer = await ProductOffer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ message: 'Product offer not found' });
    }
    
    await offer.remove();
    
    res.status(200).json({ message: 'Product offer deleted successfully' });
  } catch (error) {
    console.error('Error deleting product offer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get active offer for a specific product
export const getActiveOfferForProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Validate productId
    if (!productId || productId === 'undefined' || productId === 'null') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    const now = new Date();
    
    const offer = await ProductOffer.findOne({
      product: productId,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });
    
    if (!offer) {
      return res.status(404).json({ message: 'No active offer found for this product' });
    }
    
    res.status(200).json(offer);
  } catch (error) {
    console.error('Error fetching active product offer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
