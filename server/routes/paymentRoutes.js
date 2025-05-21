import express from 'express';
import protect from '../middlewares/userProtect.js';
import {
    createPaymentOrder,
    verifyPayment,
    getRazorpayKey
} from '../controllers/paymentController.js'


const router = express.Router();

router.get('/razorpay-key' ,protect, getRazorpayKey);

router.post('/create-order',protect, createPaymentOrder);

router.post('/verify-payment' , protect , verifyPayment);

export default router;