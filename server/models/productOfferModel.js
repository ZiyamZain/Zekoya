import mongoose from 'mongoose';

const productOfferSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required']
    },
    name: {
      type: String,
      required: [true, 'Offer name is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Offer description is required'],
      trim: true
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'Discount type is required']
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: false // Changed from true to false to make it optional
    }
  },
  {
    timestamps: true
  }
);

// Validate that end date is after start date
productOfferSchema.pre('validate', function(next) {
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }
  next();
});

// Method to check if offer is currently active
productOfferSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && this.startDate <= now && this.endDate >= now;
};

const ProductOffer = mongoose.model('ProductOffer', productOfferSchema);

export default ProductOffer;