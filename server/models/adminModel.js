import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  refreshToken: { type: String },
  refreshTokenExpiry: { type: Date },
  tokenVersion: { type: Number, default: 0 },
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
