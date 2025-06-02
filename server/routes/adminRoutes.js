import express from 'express';
import { adminLogin, checkAuthStatus, refreshAdminToken, logoutAdmin } from '../controllers/adminController.js';
import protect from '../middlewares/adminProtect.js';

const router = express.Router();

router.post('/login', adminLogin);

router.post('/refresh-token', refreshAdminToken);
router.post('/logout', logoutAdmin);

router.get("/check-auth", protect, checkAuthStatus);
export default router;