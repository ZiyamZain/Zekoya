import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import mongoose from 'mongoose';
import User from '../models/userModel.js';
import sendEmail from '../utils/sendEmail.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/generateToken.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: tokenFromRequest } = req.body;
    
    if (!tokenFromRequest || typeof tokenFromRequest !== 'string' || !tokenFromRequest.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Refresh token is required and must be a non-empty string' 
      });
    }
    
    const decoded = verifyRefreshToken(tokenFromRequest);
    if (!decoded) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid or expired session. Please log in again.' 
      });
    }
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    if (user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ 
        success: false,
        message: 'Session expired. Please log in again.' 
      });
    }
    
    // Verify the refresh token matches the one in the database
    if (user.refreshToken !== tokenFromRequest || user.refreshTokenExpiry < new Date()) {
      return res.status(401).json({ 
        success: false,
        message: 'Session expired. Please log in again.' 
      });
    }
    
    // Increment token version to invalidate old tokens
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    
    // Generate new tokens with updated version
    const accessToken = generateAccessToken(user._id, user.tokenVersion);
    const refreshToken = generateRefreshToken(user._id, user.tokenVersion);
    
    // Update user with new refresh token
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    // Send response with standardized token field names
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isGoogle: user.isGoogle,
      isVerified: user.isVerified,
      profileImage: user.profileImage,
      accessToken,
      refreshToken
    });
    
  } catch (error) {
    console.error('Error in refreshToken controller:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during token refresh' 
    });
  }
};

export const registerUser = async (req, res) => {
  try {
    const {
      name, email, password, referralCode,
    } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&#_.]{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 6 characters and include uppercase, lowercase, and a number',
      });
    }

    let user = await User.findOne({ email });

    // check referral code if provided
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (!referrer) {
        return res.status(400).json({ message: 'Invalid referral code' });
      }
      referredBy = referrer._id;
    }
    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ message: 'User already exists' });
      }

      user.name = name;
      user.password = password;
      if (referredBy) {
        user.referredBy = referredBy;
      }
      user.otp = {
        code: generateOTP(),
        expiry: new Date(Date.now() + 5 * 60 * 1000),
      };
      console.log(`DEV OTP for ${email}:`, user.otp.code);
      await user.save();
      try {
        await sendEmail(email, 'Your OTP', `Your OTP is ${user.otp.code}`);
      } catch (emailError) {
        console.error('Email sending failed:', emailError.message);
        return res.status(500).json({ message: 'Failed to send OTP email' });
      }
      return res.status(201).json({
        message: 'OTP sent to email',
        userId: user._id,
        otpSent: true,
      });
    }

    // Create new user if not found
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    console.log(` hehe DEV OTP for ${email}:`, otp);
    user = await User.create({
      name,
      email,
      password,
      isVerified: false,
      referredBy,
      otp: { code: otp, expiry: otpExpiry },
    });

    try {
      await sendEmail(email, 'Your OTP', `Your OTP is ${otp}`);
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
      await User.deleteOne({ _id: user._id });
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.status(201).json({
      message: 'OTP sent to email',
      userId: user._id,
      otpSent: true,
    });
  } catch (error) {
    console.error('Register Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: 'User ID and OTP are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otp?.code) {
      return res.status(400).json({ message: 'User already verified' });
    }

    // Check OTP expiry
    if (new Date() > user.otp.expiry) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    // Verify OTP
    const isOtpMatch = otp === user.otp.code;
    if (!isOtpMatch) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Update user
    user.otp = undefined;
    user.isVerified = true;
    await user.save();

    // process referral if user was referred
    if (user.referredBy) {
      try {
        // find the active referral offer
        const ReferralOffer = mongoose.model('ReferralOffer');
        const activeOffer = await ReferralOffer.findOne({ isActive: true });

        // Get the referrer user
        const referrer = await User.findById(user.referredBy);
        if (referrer) {
         
          referrer.referralCount = (referrer.referralCount || 0) + 1;

          const referrerReward = activeOffer?.referrerRewardValue || 100;
          const newUserReward = activeOffer?.newUserRewardValue || 50;

   
          referrer.walletBalance = (referrer.walletBalance || 0) + referrerReward;

          referrer.walletHistory.push({
            type: 'credit',
            amount: referrerReward,
            description: `Referral bonus for inviting ${user.name}`,
            date: new Date(),
          });

          await referrer.save();

          // Add reward to new user's wallet
          user.walletBalance = (user.walletBalance || 0) + newUserReward;

          // Add wallet history entry for new user
          user.walletHistory.push({
            type: 'credit',
            amount: newUserReward,
            description: 'Welcome bonus for joining with a referral',
            date: new Date(),
          });

          await user.save();
        }
      } catch (error) {
        console.error('Error processing referral : ', error);
      }
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.tokenVersion);
    const refreshToken = generateRefreshToken(user._id, user.tokenVersion);
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store refresh token in database
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = refreshTokenExpiry;
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      isGoogle: user.isGoogle,
      isVerified: user.isVerified,
      walletBalance: user.walletBalance || 0,
      referralCode: user.referralCode,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Verify OTP Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check verification status
    if (!user.isVerified && !user.isGoogle) {
      return res
        .status(401)
        .json({ message: 'Please verify your email first' });
    }

    // Check if Google account
    if (user.isGoogle) {
      return res.status(400).json({ message: 'Please sign in using Google' });
    }

    // Check if blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account is blocked' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.tokenVersion);
    const refreshToken = generateRefreshToken(user._id, user.tokenVersion);
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // store refresh token in database
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = refreshTokenExpiry;

    // Ensure profileImage is an object before saving, correcting malformed string data
    if (user.profileImage && typeof user.profileImage === 'string') {
      user.profileImage = { url: user.profileImage, public_id: '' };
    } else if (!user.profileImage || typeof user.profileImage.url === 'undefined' || typeof user.profileImage.public_id === 'undefined') {
      // If profileImage is null, undefined, or not the expected object structure (e.g. just {url: 'blah'}), ensure it adheres to schema default
      user.profileImage = { url: user.profileImage && typeof user.profileImage.url !== 'undefined' ? user.profileImage.url : '', public_id: '' };
    }

    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      isGoogle: user.isGoogle,
      isVerified: user.isVerified,
      accessToken: accessToken,
      refreshToken: refreshToken
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token missing' });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const {
      name, email, picture: profileImage,
    } = payload;

    let user = await User.findOne({ email });

    if (user) {
      if (!user.isGoogle) {
        return res
          .status(400)
          .json({ message: 'Please login using email and password' });
      }

      if (user.isBlocked) {
        return res
          .status(403)
          .json({ message: 'Your account is blocked by admin' });
      }
    } else {
      user = await User.create({
        name,
        email,
        isGoogle: true,
        profileImage: { url: profileImage, public_id: '' },
        isVerified: true,
      });
    }

    const accessToken = generateAccessToken(user._id, user.tokenVersion);
    const refreshToken = generateRefreshToken(user._id, user.tokenVersion);
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Ensure profileImage is an object before saving, correcting malformed string data
    // and updating with the latest picture from Google for existing users.
    // 'profileImage' variable here comes from: const { name, email, picture: profileImage } = payload;

    if (user.profileImage && typeof user.profileImage === 'string') {
      // Case 1: profileImage was a string (old bad data from a previous Google login or manual entry)
      user.profileImage = { url: profileImage || user.profileImage, public_id: '' };
    } else if (user.profileImage && typeof user.profileImage === 'object' && typeof user.profileImage.url !== 'undefined') {
      // Case 2: profileImage is already an object, update URL from Google, preserve existing public_id
      user.profileImage.url = profileImage || user.profileImage.url; 
      // Ensure public_id exists, even if empty, to conform to schema
      if (typeof user.profileImage.public_id === 'undefined') {
        user.profileImage.public_id = '';
      }
    } else {
      // Case 3: profileImage was null, undefined, or not a usable object. Create/reset it using Google's picture.
      user.profileImage = { url: profileImage || '', public_id: '' };
    }

    // Store refresh token in database
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = refreshTokenExpiry;
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      isGoogle: user.isGoogle,
      isVerified: user.isVerified,
      accessToken: accessToken,
      refreshToken: refreshToken
    });
  } catch (error) {
    console.error('Google login failed:', error);
    res
      .status(401)
      .json({ message: 'Invalid Google token', error: error.message }); // Log detailed error
  }
};

export const sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Input validation
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5-minute expiry
    user.otp = { code: otp, expiry: otpExpiry };
    await user.save();
    console.log(`DEV FORGOT PASSWORD OTP for ${email}:`, otp);

    // Send OTP email
    await sendEmail(email, 'Your Password Reset OTP', `Your OTP is ${otp}`);

    res.status(200).json({ message: 'OTP sent to email', userId: user._id });
  } catch (error) {
    console.error('Forgot Password Send OTP Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    // Input validation
    if (!userId || !otp) {
      return res.status(400).json({ message: 'User ID and OTP are required' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check OTP existence
    if (!user.otp?.code) {
      return res.status(400).json({ message: 'No OTP requested' });
    }

    // Check OTP expiry
    if (new Date() > user.otp.expiry) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    // Verify OTP
    const isOtpMatch = otp === user.otp.code;
    if (!isOtpMatch) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Clear OTP
    user.otp = undefined;
    await user.save();

    res.status(200).json({ message: 'OTP verified' });
  } catch (error) {
    console.error('Forgot Password Verify OTP Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Input validation
    if (!userId || !password) {
      return res
        .status(400)
        .json({ message: 'User ID and password are required' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&#_.]{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 6 characters and include uppercase, lowercase, and a number',
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP verification is pending
    if (user.otp && user.otp.code) {
      return res.status(400).json({ message: 'OTP verification required' });
    }

    // Update password
    user.password = password;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Forgot Password Change Password Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    console.log(`DEV OTP for ${email}:`, otp);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    user.otp = { code: otp, expiry: otpExpiry };
    await user.save();

    // Send OTP email
    await sendEmail(email, 'Your OTP', `Your OTP is ${otp}`);

    res.status(200).json({
      message: 'OTP resent to email',
      userId: user._id,
      otpSent: true,
    });
  } catch (error) {
    console.error('Resend OTP Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const { refreshToken: tokenFromRequest } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    // verify the refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(200).json({ message: 'Logged out successfully' });
    }

    // Find user by ID
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(200).json({ message: 'Logged out successfully' });
    }
    // Increment token version to invalidate all existing tokens
    user.tokenVersion = (user.tokenVersion || 0) + 1;

    // Clear refresh token
    user.refreshToken = null;
    user.refreshTokenExpiry = null;

    await user.save();

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const checkAuthStatus = async (req, res) => {
  try {
    // This endpoint will only be accessible if the user is authenticated
    // due to the protect middleware that will be applied to this route

    // Return user information without sensitive data
    res.status(200).json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      profileImage: req.user.profileImage,
      isGoogle: req.user.isGoogle,
      isVerified: req.user.isVerified,
      walletBalance: req.user.walletBalance || 0,
      referralCode: req.user.referralCode,
      isAuthenticated: true,
    });
  } catch (error) {
    console.error('Auth Status Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
