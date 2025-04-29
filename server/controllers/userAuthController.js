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

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 
    console.log(otp)

    const user = await User.create({
      name,
      email,
      password,
      otp: {
        code: otp,
        expiry: otpExpiry,
      },
      isVerified: false, 
    });

    await sendEmail(email, "Your OTP", `Your OTP is ${otp}`);

    res.status(201).json({
      message: "OTP sent to email",
      userId: user._id,
      otpSent: true,
      otp, 
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: "User not found" });

    if (!user.otp?.code)
      return res.status(400).json({ message: "User already verified" });

    if (new Date() > user.otp.expiry)
      return res.status(400).json({ message: "OTP expired" });

    const isOtpMatch = await bcrypt.compare(otp, user.otp.code);
    if (!isOtpMatch) return res.status(400).json({ message: "Invalid OTP" });

    user.otp = undefined;
    user.isVerified = true; 
    await user.save();

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
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    if (!user.isVerified && !user.isGoogle)
      return res
        .status(400)
        .json({ message: "Please verify your email first" });

    if (user.isGoogle)
      return res.status(400).json({ message: "Please sign in using Google" });

    if (user.isBlocked)
      return res.status(403).json({ message: "Your account is blocked" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

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
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
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
    res.status(401).json({ message: "Invalid Google token", error: error.message }); // Log detailed error
  }
};


export const sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    const otp = generateOTP();
    console.log(otp)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    user.otp = { code: otp, expiry: otpExpiry };
    await user.save();
    console.log(`DEV FORGOT PASSWORD OTP for ${email}:`, otp);
    await sendEmail(email, "Your Password Reset OTP", `Your OTP is ${otp}`);
    res.status(200).json({ message: "OTP sent to email", userId: user._id, otp }); // DEV: include otp
  } catch (error) {
    console.error("ForgotPassword Send OTP Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.otp?.code)
      return res.status(400).json({ message: "No OTP requested" });
    if (new Date() > user.otp.expiry)
      return res.status(400).json({ message: "OTP expired" });
    const isOtpMatch = await bcrypt.compare(otp, user.otp.code);
    if (!isOtpMatch) return res.status(400).json({ message: "Invalid OTP" });
    user.otp = undefined;
    await user.save();
    res.status(200).json({ message: "OTP verified" });
  } catch (error) {
    console.error("ForgotPassword Verify OTP Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const changePassword = async (req, res) => {
  try {
    const { userId, password } = req.body;
    if (!userId || !password)
      return res.status(400).json({ message: "UserId and password are required" });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.otp && user.otp.code)
      return res.status(400).json({ message: "OTP verification required" });
    user.password = password;
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("ForgotPassword Change Password Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
