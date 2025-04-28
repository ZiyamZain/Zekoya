import express from "express";
import {
  registerUser,
  loginUser,
  verifyOTP,
  googleLogin,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  changePassword,
} from "../controllers/userAuthController.js";
import passport from "passport";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOTP);
router.post("/google-login", googleLogin);
router.post("/forgot-password/send-otp", sendForgotPasswordOtp);
router.post("/forgot-password/verify-otp", verifyForgotPasswordOtp);
router.post("/forgot-password/change-password", changePassword);

// Profile route to fetch user details using JWT
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({ user: req.user }); // req.user will be populated from JWT payload
  }
);

export default router;
