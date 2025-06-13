import mongoose from 'mongoose';

const categoryOfferSchema = mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    name: {
      type: String,
      required: [true, 'Offer name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Offer description is required'],
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'Discount type is required'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: false, // Changed from true to false to make it optional
    },
  },
  {
    timestamps: true,
  },
);

// Validate that end date is after start date
categoryOfferSchema.pre('validate', async function (next) {
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }

  // Validate discount value based on type and category's highest product price
  if (this.category) {
    try {
      // Get the highest price among all products in this category
      const maxPrice = await mongoose.model('Product').aggregate([
        { $match: { category: this.category } },
        { $group: { _id: null, maxPrice: { $max: '$price' } } }
      ]).then(result => result[0]?.maxPrice || 0);

      if (!maxPrice) {
        this.invalidate('category', 'No products found in this category');
        return next();
      }

      if (this.discountType === 'fixed') {
        if (this.discountValue > maxPrice) {
          this.invalidate(
            'discountValue',
            `Fixed discount cannot be greater than highest product price in category (${maxPrice})`
          );
        }
      } else if (this.discountType === 'percentage') {
        if (this.discountValue > 100) {
          this.invalidate(
            'discountValue',
            'Percentage discount cannot be greater than 100%'
          );
        }
      }
    } catch (error) {
      console.error('Error validating category price:', error);
      this.invalidate('category', 'Error validating category price');
    }
  }

  next();
});

// Method to check if offer is currently active
categoryOfferSchema.methods.isCurrentlyActive = function () {
  const now = new Date();
  return this.isActive && this.startDate <= now && this.endDate >= now;
};

categoryOfferSchema.index({ category: 1 });
categoryOfferSchema.index({ startDate: 1, endDate: 1 });
categoryOfferSchema.index({ isActive: 1 });

const CategoryOffer = mongoose.model('CategoryOffer', categoryOfferSchema);

export default CategoryOffer;
