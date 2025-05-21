import express from "express";
import protect from "../middlewares/userProtect.js";
import {
  getWallet,
  addFunds,
  useWalletBalance,
} from "../controllers/walletController.js";

const router = express.Router();

router.get("/", protect, getWallet);
router.post("/add", protect, addFunds);
router.post("/use", protect, useWalletBalance);

export default router;
