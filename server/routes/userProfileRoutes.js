import express from "express";
import protect from "../middlewares/userProtect.js";
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
} from "../controllers/userProfileController.js";

const router = express.Router();

//profile routes

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.post("/change-email", protect, changeEmail);
router.post("/verify-email-change", protect, verifyEmailChange);
router.post("/change-password", protect, changePassword);

//Address routes

router.get("/addresses", protect, getAddresses);
router.post("/addresses", protect, addAddress);
router.put("/addresses/:id", protect, updateAddress);
router.delete("/addresses/:id", protect, deleteAddress);
router.put("/addresses/:id/default", protect, setDefaultAddress);

export default router;
