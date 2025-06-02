import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/sendEmail.js";
import { generateAccessToken } from "../utils/generateToken.js";
import axios from "axios";

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


export const getUserProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    const user = await User.findById(req.user._id)
      .select('name email phone profileImage isVerified isGoogle addresses createdAt walletBalance walletHistory referralCode referralCount')
      .lean(); 
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Convert relative image paths to full URLs
    if (user.profileImage && user.profileImage.startsWith('/uploads/')) {
      user.profileImage = `http://localhost:5001${user.profileImage}`;
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const updateUserProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (req.body.name) {
      user.name = req.body.name;
    }
    
    if (req.body.phone) {
      user.phone = req.body.phone;
    }
    
    if (req.file) {
      try {
        const filename = req.file.filename;
        
        user.profileImage = `http://localhost:5001/uploads/${filename}`;
      } catch (fileError) {
        console.error('Error processing file:', fileError);

      }
    } else {
      console.log('No file uploaded with this request');
    }
    
    const updatedUser = await user.save();
    
    // Return the updated user data
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      profileImage: updatedUser.profileImage,
      isVerified: updatedUser.isVerified,
      isGoogle: updatedUser.isGoogle,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const changeEmail = async (req, res) => {
  try {
    const { newEmail } = req.body;

    if (!newEmail) {
      return res.status(400).json({ message: "New email is required" });
    }

    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOTP();
    console.log(`otp :- ${otp}`);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.otp = { code: otp, expiry: otpExpiry };
    user.tempEmail = newEmail;
    await user.save();

    await sendEmail(
      newEmail,
      "Email Change Verification",
      `Your OTP is ${otp}`
    );

    res.status(200).json({ message: "OTP sent to new email" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const verifyEmailChange = async (req, res) => {
  try {
    const { otp } = req.body;
    
    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (!user.otp || !user.otp.code) {
      return res.status(400).json({ message: "No OTP request found" });
    }
    
    if (new Date() > user.otp.expiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (otp !== user.otp.code) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    
    user.email = user.tempEmail;
    user.tempEmail = undefined;
    user.otp = undefined;
    await user.save();
    
    res.status(200).json({
      message: "Email updated successfully",
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const requestPasswordChangeOtp = async (req, res) => {
  try {
    const { currentPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ message: "Current password is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isGoogle) {
      return res
        .status(400)
        .json({ message: "Google users cannot change password" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    console.log(`PASSWORD CHANGE OTP FOR ${user.email}: ${otp}`);

    user.passwordChangeOtp = { code: otp, expiry: otpExpiry };
    await user.save();

    try {
      await sendEmail(
        user.email,
        "Password Change Verification",
        `Your OTP for password change is ${otp}`
      );
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
    }

    res.status(200).json({ message: "OTP sent to your email", otpSent: true });
  } catch (error) {
    console.error("Password Change OTP Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const verifyPasswordChangeOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    
    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (!user.passwordChangeOtp || !user.passwordChangeOtp.code) {
      return res.status(400).json({ message: "No OTP request found" });
    }
    

    if (new Date() > user.passwordChangeOtp.expiry) {
      return res.status(400).json({ message: "OTP expired" });
    }
    
    if (otp !== user.passwordChangeOtp.code) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    
    res.status(200).json({ message: "OTP verified successfully", otpVerified: true });
  } catch (error) {
    console.error("Password Change OTP Verification Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if Google user
    if (user.isGoogle) {
      return res.status(400).json({ message: "Google users cannot change password" });
    }
    
    if (!user.passwordChangeOtp || !user.passwordChangeOtp.code) {
      return res.status(400).json({ message: "OTP verification required" });
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&#_.]{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 6 characters and include uppercase, lowercase, and a number"
      });
    }
    
    user.password = newPassword;
    user.passwordChangeOtp = undefined;
    await user.save();
    
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password Change Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAddresses = async (req, res) => {
  
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    const user = await User.findById(req.user._id).select("addresses").lean();
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user.addresses || []);
  } catch (error) {
    console.error('Error in getAddresses:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addAddress = async (req, res) => {
  try {
    const {
      name,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    if (!name || !phone || !addressLine1 || !city || !state || !postalCode) {
      return res.status(400).json({ message: "Required fields missing" });
    }
    // Validate phone number (India: 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res
        .status(400)
        .json({ message: "Invalid phone number. Must be 10 digits." });
    }

    // Validate postal code (India: 6 digits)
    const postalCodeRegex = /^[0-9]{6}$/;
    if (!postalCodeRegex.test(postalCode)) {
      return res
        .status(400)
        .json({ message: "Invalid postal code. Must be 6 digits." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newAddress = {
      name,
      phone,
      addressLine1,
      addressLine2: addressLine2 || "",
      city,
      state,
      postalCode,
      country: country || "India",
      isDefault: isDefault || false,
    };



    if (isDefault || user.addresses.length === 0) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
      newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      message: "Address added successfully",
      address: user.addresses[user.addresses.length - 1],
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const {
      name,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault
    } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );
    
    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }
    
    const updatedAddress = {
      name: name || user.addresses[addressIndex].name,
      phone: phone || user.addresses[addressIndex].phone,
      addressLine1: addressLine1 || user.addresses[addressIndex].addressLine1,
      addressLine2:
        addressLine2 !== undefined
          ? addressLine2
          : user.addresses[addressIndex].addressLine2,
      city: city || user.addresses[addressIndex].city,
      state: state || user.addresses[addressIndex].state,
      postalCode: postalCode || user.addresses[addressIndex].postalCode,
      country: country || user.addresses[addressIndex].country,
    };

    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      ...updatedAddress,
    };

    if (isDefault) {
      user.addresses.forEach((addr, index) => {
        addr.isDefault = index === addressIndex;
      });
    }
    
    await user.save();
    
    res.status(200).json({
      message: "Address updated successfully",
      address: user.addresses[addressIndex]
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );
    
    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }
    

    const isDefault = user.addresses[addressIndex].isDefault;
    
    user.addresses.splice(addressIndex, 1);
  
    if (isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }
    
    await user.save();
    
    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );
    
    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }
    
    user.addresses.forEach((addr, index) => {
      addr.isDefault = index === addressIndex;
    });
    
    await user.save();
    
    res.status(200).json({
      message: "Default address updated",
      address: user.addresses[addressIndex]
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user wallet balance
export const getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({
      walletBalance: user.walletBalance || 0,
      walletHistory: user.walletHistory || []
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Check if user is blocked
export const checkUserStatus = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    const user = await User.findById(req.user._id).select('isBlocked').lean();
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ 
      isBlocked: user.isBlocked || false
    });
  } catch (error) {
    console.error('Error in checkUserStatus:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
