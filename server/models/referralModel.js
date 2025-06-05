import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema(
  {
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    referred: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    referralCode: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'rewarded'],
      default: 'pending',
    },
    completedAt: {
      type: Date,
    },
    rewardedAt: {
      type: Date,
    },
    rewardType: {
      type: String,
      enum: ['coupon', 'wallet_credit'],
    },
    rewardValue: {
      type: Number,
    },
    couponCode: {
      type: String,
    },
    referralOffer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReferralOffer',
    },
  },
  {
    timestamps: true,
  },
);

// Ensure uniqueness of referrer-referred pair
referralSchema.index({ referrer: 1, referred: 1 }, { unique: true });

// Add indices for faster queries
referralSchema.index({ referralCode: 1 });
referralSchema.index({ status: 1 });

const Referral = mongoose.model('Referral', referralSchema);

export default Referral;
