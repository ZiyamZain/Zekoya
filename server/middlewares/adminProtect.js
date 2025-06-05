import { verifyAccessToken } from '../utils/generateToken.js';
import Admin from '../models/adminModel.js';

const adminProtect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }

    // Get admin from database
    const admin = await Admin.findById(decoded.userId);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Check if token version matches (for token revocation)

    if ((admin.tokenVersion || 0) !== decoded.tokenVersion) {
      return res.status(401).json({ message: 'Not authorized, token revoked' });
    }

    // Attach admin to request object

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin Auth Error:', error.message);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export default adminProtect;
