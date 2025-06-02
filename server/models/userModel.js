import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  addressLine1: { type: String, required: true, trim: true },
  addressLine2: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true, default: "India" },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    tempEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    password: { type: String },//not required for google users
    isGoogle: { type: Boolean, default: false },
    googleId: { type: String ,unique:true ,sparse:true},
    isBlocked: { type: Boolean, default: false },
    profileImage: { type: String, default: "" },
    isVerified: { type: Boolean, default: false }, 
    otp: {
      code: String,
      expiry: Date,
    },
    passwordChangeOtp: {
      code: String,
      expiry: Date,
    },
    addresses: [addressSchema],
    defaultAddressId :{type:mongoose.Schema.Types.ObjectId,ref:"Address"},
    phone:{type:String , trim:true},
    walletBalance: { type: Number, default: 0 },
    walletHistory: [{
      type: { type: String, enum: ['credit', 'debit'], required: true },
      amount: { type: Number, required: true },
      description: { type: String, required: true },
      date: { type: Date, default: Date.now },
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
    }],
    // New fields for referral system
    referralCode: { 
      type: String, 
      unique: true,
      sparse: true
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true
    },
    referralCount: {
      type: Number,
      default: 0
    },
    refreshToken: {
      type: String,
      default: null
    },
    refreshTokenExpiry: {
      type: Date,
      default: null
    },
    tokenVersion: {
      type: Number,
      default: 0 // Incremented when we need to invalidate all tokens
    }
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  // Generate referral code if it doesn't exist
  if (!this.referralCode) {
    // Generate a unique referral code based on user ID and a random string
    const randomBytes = crypto.randomBytes(4).toString('hex').toUpperCase();
    this.referralCode = `ZK${randomBytes}`;
  }
  
  next();
});

// Add TTL index for otp.expiry
userSchema.index({ "otp.expiry": 1 }, { expireAfterSeconds: 0 });
// Note: referralCode already has a unique index from the schema definition

export default mongoose.model("User", userSchema);
