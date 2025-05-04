import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
    addresses: [addressSchema],
    defaultAddressId :{type:mongoose.Schema.Types.ObjectId,ref:"Address"},
    phone:{type:String , trim:true},
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
  next();
});

// Add TTL index for otp.expiry
userSchema.index({ "otp.expiry": 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("User", userSchema);
