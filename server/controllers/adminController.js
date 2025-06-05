import bcrypt from 'bcryptjs';
import Admin from '../models/adminModel.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/generateToken.js';

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        message: 'Valid email is required',
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        message: 'Valid password is required',
      });
    }

    const admin = await Admin.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

    if (!admin) {
      return res.status(404).json({
        message: 'Admin not found',
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    // Generate JWTs (access and refresh tokens)
    const accessToken = generateAccessToken(admin._id, admin.tokenVersion);
    const refreshToken = generateRefreshToken(admin._id, admin.tokenVersion);
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store refresh token and expiry in DB
    admin.refreshToken = refreshToken;
    admin.refreshTokenExpiry = refreshTokenExpiry;
    await admin.save();

    res.status(200).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Admin Login Error:', error.message);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

export const refreshAdminToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'No refresh token provided' });
    }

    // Find admin with this refresh token
    const admin = await Admin.findOne({ refreshToken });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Check if expired
    if (!admin.refreshTokenExpiry || new Date() > admin.refreshTokenExpiry) {
      return res.status(401).json({ message: 'Refresh token expired' });
    }

    // Verify the refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || decoded.userId !== String(admin._id) || decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Check token version
    if ((admin.tokenVersion || 0) !== decoded.tokenVersion) {
      return res.status(401).json({ message: 'Refresh token revoked' });
    }

    // Generate new access token (and optionally rotate refresh token)
    const accessToken = generateAccessToken(admin._id, admin.tokenVersion);
    // Optionally rotate refresh token for extra security
    // const newRefreshToken = generateRefreshToken(admin._id, admin.tokenVersion);
    // const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    // admin.refreshToken = newRefreshToken;
    // admin.refreshTokenExpiry = newExpiry;
    // await admin.save();

    res.status(200).json({
      accessToken,
      // refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Admin Refresh Token Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const logoutAdmin = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'No refresh token provided' });
    }
    const admin = await Admin.findOne({ refreshToken });
    if (!admin) {
      return res.status(200).json({ message: 'Already logged out' });
    }
    // Invalidate refresh token and bump tokenVersion
    admin.refreshToken = null;
    admin.refreshTokenExpiry = null;
    admin.tokenVersion = (admin.tokenVersion || 0) + 1;
    await admin.save();
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Admin Logout Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const checkAuthStatus = async (req, res) => {
  try {
    // This endpoint will only be accessible if the admin is authenticated
    // due to the protect middleware that will be applied to this route

    // Return admin information without sensitive data
    res.status(200).json({
      _id: req.admin._id,
      name: req.admin.name || 'Admin',
      email: req.admin.email,
      isAuthenticated: true,
    });
  } catch (error) {
    console.error('Admin Auth Status Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
