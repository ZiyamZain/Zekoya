import mongoose from 'mongoose';

const referralOfferSchema = mongoose.Schema(
  {
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
    rewardType: {
      type: String,
      enum: ['percentage', 'fixed', 'points'],
      required: [true, 'Reward type is required'],
    },
    rewardValue: {
      type: Number,
      required: [true, 'Reward value is required'],
      min: [0, 'Reward value cannot be negative'],
    },
    referrerReward: {
      type: Number,
      required: [true, 'Referrer reward is required'],
      min: [0, 'Referrer reward cannot be negative'],
    },
    refereeReward: {
      type: Number,
      required: [true, 'Referee reward is required'],
      min: [0, 'Referee reward cannot be negative'],
    },
    minimumPurchaseAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum purchase amount cannot be negative'],
    },
    maxReferrals: {
      type: Number,
      default: null,
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
referralOfferSchema.pre('validate', function (next) {
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }
  next();
});

// Method to check if offer is currently active
referralOfferSchema.methods.isCurrentlyActive = function () {
  const now = new Date();
  return this.isActive && this.startDate <= now && this.endDate >= now;
};

const ReferralOffer = mongoose.model('ReferralOffer', referralOfferSchema);

export default ReferralOffer;
