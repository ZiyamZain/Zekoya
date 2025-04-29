import express from 'express';
import { adminLogin } from '../controllers/adminController.js';

const router = express.Router();

router.post('/login' , adminLogin);
// router.post('/create', createAdmin);

export default router;