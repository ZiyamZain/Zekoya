import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
    password: { type: String },
    isGoogle: { type: Boolean, default: false },
    googleId: { type: String },
    isBlocked: { type: Boolean, default: false },
    profileImage: { type: String, default: "" },
    isVerified: { type: Boolean, default: false }, // Added isVerified
    otp: {
      code: String,
      expiry: Date,
    },
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
  if (this.otp?.code) {
    const salt = await bcrypt.genSalt(10);
    this.otp.code = await bcrypt.hash(this.otp.code, salt);
  }
  next();
});

// Add TTL index for otp.expiry
userSchema.index({ "otp.expiry": 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("User", userSchema);
