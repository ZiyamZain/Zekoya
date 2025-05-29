import mongoose, { model } from 'mongoose';

const categoryOfferSchema = mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
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
categoryOfferSchema.pre('validate', function(next) {
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }
  next();
});

// Method to check if offer is currently active
categoryOfferSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && this.startDate <= now && this.endDate >= now;
};

categoryOfferSchema.index({ category: 1 });
categoryOfferSchema.index({ startDate: 1, endDate: 1 });
categoryOfferSchema.index({ isActive: 1 });

const CategoryOffer = mongoose.model('CategoryOffer', categoryOfferSchema);

export default CategoryOffer;
