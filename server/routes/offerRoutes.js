import express from 'express';
import { getActiveOfferForProduct } from '../controllers/productOfferController.js';
import { getActiveOfferForCategory } from '../controllers/categoryOfferController.js';
import { getActiveReferralOffer, processReferral } from '../controllers/referralOfferController.js';
import { getAllActiveOffers } from '../controllers/userOfferController.js';
import  protect  from '../middlewares/userProtect.js';

const router = express.Router();

// Get all active offers
router.get('/active', getAllActiveOffers);

// Get active offer for a product
router.get('/product/active/:productId', getActiveOfferForProduct);

// Get active offer for a category
router.get('/category/active/:categoryId', getActiveOfferForCategory);

// Get active referral offer
router.get('/referral/active', getActiveReferralOffer);

// Process a referral
router.post('/referral/process', protect, processReferral);

export default router;
