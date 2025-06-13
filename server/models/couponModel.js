import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0,
  },
  minPurchase: {
    type: Number,
    default: 0,
  },
  maxDiscount: {
    type: Number,
    default: null,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  usageLimit: {
    type: Number,
    default: null,
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Validate coupon values
couponSchema.pre('validate', function (next) {
  // Validate dates
  if (this.endDate <= this.startDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }

  // Validate discount values
  if (this.discountType === 'percentage') {
    if (this.discountValue > 100) {
      this.invalidate('discountValue', 'Percentage discount cannot be greater than 100%');
    }
  }

  // Validate usage limits
  if (this.usageLimit !== null && this.usageLimit <= this.usedCount) {
    this.invalidate('usageLimit', 'Usage limit cannot be less than or equal to current used count');
  }

  next();
});

// Method to check if coupon is valid
couponSchema.methods.isValid = function (orderAmount) {
  const now = new Date();

  if (!this.isActive) {
    return { isValid: false, message: 'This coupon is not active' };
  }
  if (now < this.startDate) {
    return { isValid: false, message: 'This coupon is not yet valid' };
  }

  if (now > this.endDate) {
    return { isValid: false, message: 'This coupon has expired' };
  }

  if (orderAmount < this.minPurchase) {
    return { isValid: false, message: `Minimum purchase amount is ${this.minPurchase}` };
  }

  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
    return { isValid: false, message: 'This coupon has reached its usage limit' };
  }

  return { isValid: true };
};

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
