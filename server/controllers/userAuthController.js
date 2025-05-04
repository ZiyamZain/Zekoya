import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import generateToken from "../utils/generateToken.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters and include uppercase, lowercase, and a number",
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ message: "User already exists" });
      } else {
        // User exists but not verified: update info and resend OTP
        user.name = name;
        user.password = password;
        user.otp = {
          code: generateOTP(),
          expiry: new Date(Date.now() + 5 * 60 * 1000),
        };
        console.log(`DEV OTP for ${email}:`, user.otp.code);
        await user.save();
        try {
          await sendEmail(email, "Your OTP", `Your OTP is ${user.otp.code}`);
        } catch (emailError) {
          console.error("Email sending failed:", emailError.message);
          return res.status(500).json({ message: "Failed to send OTP email" });
        }
        return res.status(201).json({
          message: "OTP sent to email",
          userId: user._id,
          otpSent: true,
        });
      }
    }

    // Create new user if not found
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    console.log(`DEV OTP for ${email}:`, otp);
    user = await User.create({
      name,
      email,
      password,
      isVerified: false,
      otp: { code: otp, expiry: otpExpiry },
    });

    try {
      await sendEmail(email, "Your OTP", `Your OTP is ${otp}`);
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);
      await User.deleteOne({ _id: user._id });
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    res.status(201).json({
      message: "OTP sent to email",
      userId: user._id,
      otpSent: true,
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    // Input validation
    if (!userId || !otp) {
      return res.status(400).json({ message: "User ID and OTP are required" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {

      return res.status(404).json({ message: "User not found" });
    }

    // Check if already verified
    if (!user.otp?.code) {

      return res.status(400).json({ message: "User already verified" });
    }

    // Check OTP expiry
    if (new Date() > user.otp.expiry) {

      return res.status(400).json({ message: "OTP expired" });
    }

    // Verify OTP
    const isOtpMatch = otp === user.otp.code;
    if (!isOtpMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Update user
    user.otp = undefined;
    user.isVerified = true;
    await user.save();

    // Generate JWT
    const token = generateToken(user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      isGoogle: user.isGoogle,
      isVerified: user.isVerified,
      token,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check verification status
    if (!user.isVerified && !user.isGoogle) {
      return res
        .status(400)
        .json({ message: "Please verify your email first" });
    }

    // Check if Google account
    if (user.isGoogle) {
      return res.status(400).json({ message: "Please sign in using Google" });
    }

    // Check if blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account is blocked" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT
    const token = generateToken(user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      isGoogle: user.isGoogle,
      isVerified: user.isVerified,
      token,
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token missing" });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email, sub: googleId, picture: profileImage } = payload;

    let user = await User.findOne({ email });

    if (user) {
      if (!user.isGoogle) {
        return res
          .status(400)
          .json({ message: "Please login using email and password" });
      }

      if (user.isBlocked) {
        return res
          .status(403)
          .json({ message: "Your account is blocked by admin" });
      }
    } else {
      user = await User.create({
        name,
        email,
        isGoogle: true,
        profileImage,
        isVerified: true,
      });
    }

    const jwtToken = generateToken(user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      isGoogle: user.isGoogle,
      isVerified: user.isVerified,
      token: jwtToken,
    });
  } catch (error) {
    console.error("Google login failed:", error);
    res
      .status(401)
      .json({ message: "Invalid Google token", error: error.message }); // Log detailed error
  }
};


export const sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Input validation
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5-minute expiry
    user.otp = { code: otp, expiry: otpExpiry };
    await user.save();
    console.log(`DEV FORGOT PASSWORD OTP for ${email}:`, otp);

    // Send OTP email
    await sendEmail(email, "Your Password Reset OTP", `Your OTP is ${otp}`);

    res.status(200).json({ message: "OTP sent to email", userId: user._id });
  } catch (error) {
    console.error("Forgot Password Send OTP Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    // Input validation
    if (!userId || !otp) {
      return res.status(400).json({ message: "User ID and OTP are required" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check OTP existence
    if (!user.otp?.code) {
      return res.status(400).json({ message: "No OTP requested" });
    }

    // Check OTP expiry
    if (new Date() > user.otp.expiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Verify OTP
    const isOtpMatch = otp === user.otp.code;
    if (!isOtpMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Clear OTP
    user.otp = undefined;
    await user.save();

    res.status(200).json({ message: "OTP verified" });
  } catch (error) {
    console.error("Forgot Password Verify OTP Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Input validation
    if (!userId || !password) {
      return res
        .status(400)
        .json({ message: "User ID and password are required" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters and include uppercase, lowercase, and a number",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP verification is pending
    if (user.otp && user.otp.code) {
      return res.status(400).json({ message: "OTP verification required" });
    }

    // Update password
    user.password = password;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Forgot Password Change Password Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    // Generate new OTP
    const otp = generateOTP();
    console.log(`DEV OTP for ${email}:`, otp);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    user.otp = { code: otp, expiry: otpExpiry };
    await user.save();

    // Send OTP email
    await sendEmail(email, "Your OTP", `Your OTP is ${otp}`);

    res.status(200).json({
      message: "OTP resent to email",
      userId: user._id,
      otpSent: true,
    });
  } catch (error) {
    console.error("Resend OTP Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
