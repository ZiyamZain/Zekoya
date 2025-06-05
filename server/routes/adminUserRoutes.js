import express from 'express';
import {
  getAllUsers,
  blockUser,
  unblockUser,
} from '../controllers/adminUserControllers.js';
import adminProtect from '../middlewares/adminProtect.js';

const router = express.Router();

router.get('/', adminProtect, getAllUsers);
router.patch('/block/:id', adminProtect, blockUser);
router.patch('/unblock/:id', adminProtect, unblockUser);

export default router;
