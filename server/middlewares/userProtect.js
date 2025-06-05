import User from '../models/userModel.js';
import { verifyAccessToken } from '../utils/generateToken.js';

const protect = async (req, res, next) => {
  try {
    // get token from authorization header

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }

    // verify the access token

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({ message: 'invalid or expired token' });
    }

    const user = await User.findById(decoded.userId).select('-password -refreshToken');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // verify token version matches (for forced logout)
    if (user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ message: ' Token has been revoked , Please login again' });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked. Please contact customer support.' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default protect;
