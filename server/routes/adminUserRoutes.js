import express from "express";
import {
  getAllUsers,
  blockUser,
  unblockUser,
} from "../controllers/adminUserControllers.js";
import protectAdmin  from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protectAdmin, getAllUsers);
router.patch("/block/:id", protectAdmin, blockUser);
router.patch("/unblock/:id", protectAdmin, unblockUser);

export default router;
