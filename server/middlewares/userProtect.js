import { verifyAccessToken } from '../utils/generateToken.js';
import User from '../models/userModel.js';

const protect = async (req, res, next) => {
  // Skip token check for OPTIONS requests (preflight)
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, no token provided',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, invalid token format',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Verify the access token
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, token failed',
        code: 'INVALID_OR_EXPIRED_TOKEN'
      });
    }

    // Get user from the token
    const user = await User.findById(decoded.userId).select('-password -refreshToken');
    if (!user) {
      console.error('User not found for token');
      return res.status(401).json({ 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verify token version matches (for forced logout)
    if (user.tokenVersion !== decoded.tokenVersion) {
      console.error('Token version mismatch');
      return res.status(401).json({ 
        message: 'Session expired. Please log in again.',
        code: 'TOKEN_VERSION_MISMATCH'
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      console.error('User account is blocked');
      return res.status(403).json({ 
        message: 'Account is blocked. Please contact support.',
        code: 'ACCOUNT_BLOCKED'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Error in protect middleware:', error);
    res.status(401).json({ 
      message: 'Not authorized, token failed',
      code: 'AUTHENTICATION_FAILED'
    });
  }
};

export default protect;
