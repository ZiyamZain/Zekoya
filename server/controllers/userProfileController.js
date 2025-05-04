import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/sendEmail.js";
import generateToken from "../utils/generateToken.js";

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

//get user profile

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -otp");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//update user profile

export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, profileImage } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profileImage) user.profileImage = profileImage;
    const updatedUser = await user.save();
    res
      .status(200)
      .json({
        _id: updatedUser._id,
        name: updatedUser.name,
        phone: updatedUser.phone,
        profileImage: updatedUser.profileImage,
        isVerified: updatedUser.isVerified,
        isGoogle: updatedUser.isGoogle,
        token: generateToken(updatedUser._id),
      });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// Change email - send OTP
export const changeEmail = async (req, res) => {
  try {
    const { newEmail } = req.body;
    
    if (!newEmail) {
      return res.status(400).json({ message: "New email is required" });
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    // Store OTP and new email
    user.otp = { code: otp, expiry: otpExpiry };
    user.tempEmail = newEmail;
    await user.save();
    
    // Send OTP to new email
    await sendEmail(newEmail, "Email Change Verification", `Your OTP is ${otp}`);
    
    res.status(200).json({ message: "OTP sent to new email" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Verify email change
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
    
    // Check if OTP exists
    if (!user.otp || !user.otp.code) {
      return res.status(400).json({ message: "No OTP request found" });
    }
    
    // Check if OTP is expired
    if (new Date() > user.otp.expiry) {
      return res.status(400).json({ message: "OTP expired" });
    }
    
    // Verify OTP
    if (otp !== user.otp.code) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    
    // Update email
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

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if Google user
    if (user.isGoogle) {
      return res.status(400).json({ message: "Google users cannot change password" });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    
    // Validate new password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 6 characters and include uppercase, lowercase, and a number"
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all addresses
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("addresses");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add a new address
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
      isDefault
    } = req.body;
    
    // Validate required fields
    if (!name || !phone || !addressLine1 || !city || !state || !postalCode) {
      return res.status(400).json({ message: "Required fields missing" });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Create new address
    const newAddress = {
      name,
      phone,
      addressLine1,
      addressLine2: addressLine2 || "",
      city,
      state,
      postalCode,
      country: country || "India",
      isDefault: isDefault || false
    };
    
    // If this is the first address or isDefault is true, update all other addresses
    if (isDefault || user.addresses.length === 0) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
      newAddress.isDefault = true;
    }
    
    user.addresses.push(newAddress);
    await user.save();
    
    res.status(201).json({
      message: "Address added successfully",
      address: user.addresses[user.addresses.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update an address
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
    
    // Find the address
    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );
    
    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }
    
    // Update address fields
    if (name) user.addresses[addressIndex].name = name;
    if (phone) user.addresses[addressIndex].phone = phone;
    if (addressLine1) user.addresses[addressIndex].addressLine1 = addressLine1;
    if (addressLine2 !== undefined) user.addresses[addressIndex].addressLine2 = addressLine2;
    if (city) user.addresses[addressIndex].city = city;
    if (state) user.addresses[addressIndex].state = state;
    if (postalCode) user.addresses[addressIndex].postalCode = postalCode;
    if (country) user.addresses[addressIndex].country = country;
    
    // Handle default address
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

// Delete an address
export const deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Find the address
    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );
    
    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }
    
    // Check if it's the default address
    const isDefault = user.addresses[addressIndex].isDefault;
    
    // Remove the address
    user.addresses.splice(addressIndex, 1);
    
    // If it was the default address and there are other addresses, set a new default
    if (isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }
    
    await user.save();
    
    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Set default address
export const setDefaultAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Find the address
    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );
    
    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }
    
    // Update all addresses to non-default
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

