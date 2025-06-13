import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId, tokenVersion = 0) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.sign(
    { 
      userId, 
      type: 'access',
      tokenVersion,
      iat: Math.floor(Date.now() / 1000), 
      jti: Math.random().toString(36).substr(2, 9) 
    },
    process.env.JWT_SECRET,
    { expiresIn: '1m' } // 1 minute for testing
  );
};

// Generate refresh token (7 days)
export const generateRefreshToken = (userId, tokenVersion = 0) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.sign(
    { 
      userId, 
      type: 'refresh',
      tokenVersion,
      iat: Math.floor(Date.now() / 1000), // Issued at time
      jti: Math.random().toString(36).substr(2, 9) // Unique ID for this token
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyAccessToken = (token) => {
  if (!token || typeof token !== 'string' || !token.trim()) {
    return null;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not defined in environment variables');
      return null;
    }

    // Remove 'Bearer ' prefix if present
    const tokenToVerify = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
    
    const decoded = jwt.verify(tokenToVerify, secret);
    
    // Only check the token type if it exists in the payload
    if (decoded.type && decoded.type !== 'access') {
      return null;
    }
    
    return decoded;
  } catch (error) {
    // Only log unexpected errors, not token expiration
    if (error.name !== 'TokenExpiredError' && error.name !== 'JsonWebTokenError') {
      console.error('Access token verification error:', error.message);
    }
    return null;
  }
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  if (!token || typeof token !== 'string' || !token.trim()) {
    return null;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not defined in environment variables');
      return null;
    }

    // Remove 'Bearer ' prefix if present
    const tokenToVerify = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
    
    const decoded = jwt.verify(tokenToVerify, secret);
    
    // Only check the token type if it exists in the payload
    if (decoded.type && decoded.type !== 'refresh') {
      return null;
    }
    
    return decoded;
  } catch (error) {
    // Only log unexpected errors, not token expiration
    if (error.name !== 'TokenExpiredError' && error.name !== 'JsonWebTokenError') {
      console.error('Refresh token verification error:', error.message);
    }
    return null;
  }
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
