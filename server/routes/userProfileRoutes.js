import express from "express";
import protect from "../middlewares/userProtect.js";
import { createCloudinaryUploader, handleUploadError } from "../middlewares/cloudinaryUpload.js";
import {
  getUserProfile,
  updateUserProfile,
  changeEmail,
  changePassword,
  getAddresses,
  verifyEmailChange,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  requestPasswordChangeOtp,
  verifyPasswordChangeOtp,
  checkUserStatus,
  getWalletBalance
} from "../controllers/userProfileController.js";

const router = express.Router();

const profileImageUploader = createCloudinaryUploader({
  folder: 'zekoya/user_profiles',
  transformation: [
    { width: 300, height: 300, crop: 'fill', gravity: 'face', quality: 'auto:good', fetch_format: 'auto' }
  ]
});

router.get("/", protect, getUserProfile);
router.put("/", protect, profileImageUploader.single("profileImage"), handleUploadError, updateUserProfile);
router.post("/change-email", protect, changeEmail);
router.post("/verify-email-change", protect, verifyEmailChange);

router.post("/request-password-change-otp", protect, requestPasswordChangeOtp);
router.post("/verify-password-change-otp", protect, verifyPasswordChangeOtp);
router.post("/change-password", protect, changePassword);

router.get("/check-status", protect, checkUserStatus);
router.get("/wallet", protect, getWalletBalance);

router.get("/addresses", protect, getAddresses);
router.post("/addresses", protect, addAddress);
router.put("/addresses/:id", protect, updateAddress);
router.delete("/addresses/:id", protect, deleteAddress);
router.put("/addresses/:id/default", protect, setDefaultAddress);

export default router;
