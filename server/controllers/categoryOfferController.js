import CategoryOffer from '../models/categoryOfferModel.js';
import Category from '../models/categoryModel.js';

// Get all category offers
export const getAllCategoryOffers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const offers = await CategoryOffer.find()
      .populate('category', 'name')
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CategoryOffer.countDocuments();

    res.status(200).json({
      offers,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error('Error fetching category offers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get category offer by ID
export const getCategoryOfferById = async (req, res) => {
  try {
    const offer = await CategoryOffer.findById(req.params.id)
      .populate('category', 'name')
      .populate('createdBy', 'email');

    if (!offer) {
      return res.status(404).json({ message: 'Category offer not found' });
    }

    res.status(200).json(offer);
  } catch (error) {
    console.error('Error fetching category offer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new category offer
export const createCategoryOffer = async (req, res) => {
  try {
    const {
      category, name, description, discountType, discountValue, startDate, endDate, isActive,
    } = req.body;

    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if an active offer already exists for this category
    const existingOffer = await CategoryOffer.findOne({
      category,
      isActive: true,
      $or: [
        // New offer starts during existing offer
        {
          startDate: { $lte: new Date(startDate) },
          endDate: { $gte: new Date(startDate) },
        },
        // New offer ends during existing offer
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(endDate) },
        },
        // New offer completely encompasses existing offer
        {
          startDate: { $gte: new Date(startDate) },
          endDate: { $lte: new Date(endDate) },
        },
      ],
    });

    if (existingOffer) {
      return res.status(400).json({
        message: 'An active offer already exists for this category during the specified date range',
      });
    }

    // Create new offer
    const newOffer = new CategoryOffer({
      category,
      name,
      description,
      discountType,
      discountValue,
      startDate,
      endDate,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.admin,
    });

    const savedOffer = await newOffer.save();

    res.status(201).json(savedOffer);
  } catch (error) {
    console.error('Error creating category offer:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// Update a category offer
export const updateCategoryOffer = async (req, res) => {
  try {
    const {
      category, name, description, discountType, discountValue, startDate, endDate, isActive,
    } = req.body;

    const offer = await CategoryOffer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Category offer not found' });
    }

    // If category is being changed, validate it exists
    if (category && category !== offer.category.toString()) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({ message: 'Category not found' });
      }

      // Check if an active offer already exists for the new category
      const existingOffer = await CategoryOffer.findOne({
        _id: { $ne: req.params.id },
        category,
        isActive: true,
        $or: [
          // New offer starts during existing offer
          {
            startDate: { $lte: new Date(startDate || offer.startDate) },
            endDate: { $gte: new Date(startDate || offer.startDate) },
          },
          // New offer ends during existing offer
          {
            startDate: { $lte: new Date(endDate || offer.endDate) },
            endDate: { $gte: new Date(endDate || offer.endDate) },
          },
          // New offer completely encompasses existing offer
          {
            startDate: { $gte: new Date(startDate || offer.startDate) },
            endDate: { $lte: new Date(endDate || offer.endDate) },
          },
        ],
      });

      if (existingOffer) {
        return res.status(400).json({
          message: 'An active offer already exists for this category during the specified date range',
        });
      }
    }

    // Update offer fields
    if (category) offer.category = category;
    if (name) offer.name = name;
    if (description) offer.description = description;
    if (discountType) offer.discountType = discountType;
    if (discountValue !== undefined) offer.discountValue = discountValue;
    if (startDate) offer.startDate = startDate;
    if (endDate) offer.endDate = endDate;
    if (isActive !== undefined) offer.isActive = isActive;

    const updatedOffer = await offer.save();

    res.status(200).json(updatedOffer);
  } catch (error) {
    console.error('Error updating category offer:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a category offer
export const deleteCategoryOffer = async (req, res) => {
  try {
    const offer = await CategoryOffer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: 'Category offer not found' });
    }

    await offer.deleteOne();

    res.status(200).json({ message: 'Category offer deleted successfully' });
  } catch (error) {
    console.error('Error deleting category offer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get active offer for a specific category
export const getActiveOfferForCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const now = new Date();

    const offer = await CategoryOffer.findOne({
      category: categoryId,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    if (!offer) {
      return res.status(404).json({ message: 'No active offer found for this category' });
    }

    res.status(200).json(offer);
  } catch (error) {
    console.error('Error fetching active category offer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
