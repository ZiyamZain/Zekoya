import express from "express";
import {
  registerUser,
  loginUser,
  verifyOTP,
  googleLogin,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  changePassword,
  resendOTP,
} from "../controllers/userAuthController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOTP);
router.post("/google-login", googleLogin);
router.post("/forgot-password/send-otp", sendForgotPasswordOtp);
router.post("/forgot-password/verify-otp", verifyForgotPasswordOtp);
router.post("/forgot-password/change-password", changePassword);
router.post("/resend-otp", resendOTP);


export default router;
