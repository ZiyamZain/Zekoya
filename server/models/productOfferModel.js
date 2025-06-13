import mongoose from 'mongoose';

const productOfferSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
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
productOfferSchema.pre('validate', async function (next) {
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }

  // Validate discount value based on type and product price
  if (this.product) {
    try {
      const product = await mongoose.model('Product').findById(this.product);
      if (!product) {
        this.invalidate('product', 'Product not found');
        return next();
      }

      if (this.discountType === 'fixed') {
        if (this.discountValue > product.price) {
          this.invalidate(
            'discountValue',
            `Fixed discount cannot be greater than product price (${product.price})`
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
      console.error('Error validating product price:', error);
      this.invalidate('product', 'Error validating product price');
    }
  }

  next();
});

// Method to check if offer is currently active
productOfferSchema.methods.isCurrentlyActive = function () {
  const now = new Date();
  return this.isActive && this.startDate <= now && this.endDate >= now;
};

const ProductOffer = mongoose.model('ProductOffer', productOfferSchema);

export default ProductOffer;
