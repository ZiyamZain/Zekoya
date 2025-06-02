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
    console.log('Decoded admin JWT payload:', decoded);
    if (!decoded) {
      console.log('adminProtect: Token verification failed');
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }

    // Get admin from database
    const admin = await Admin.findById(decoded.userId);
    console.log('adminProtect: Fetched admin from DB:', admin ? admin._id : null);
    if (!admin) {
      console.log('adminProtect: Admin not found in DB');
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Check if token version matches (for token revocation)
    console.log('adminProtect: Comparing tokenVersion. DB:', admin.tokenVersion, 'Token:', decoded.tokenVersion);
    if ((admin.tokenVersion || 0) !== decoded.tokenVersion) {
      console.log('adminProtect: Token version mismatch');
      return res.status(401).json({ message: 'Not authorized, token revoked' });
    }

    // Attach admin to request object
    console.log('adminProtect: Auth success, attaching admin to req');
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin Auth Error:', error.message);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export default adminProtect;
