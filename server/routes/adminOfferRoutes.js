import express from 'express';
import { 
  getAllProductOffers, 
  getProductOfferById, 
  createProductOffer, 
  updateProductOffer, 
  deleteProductOffer 
} from '../controllers/productOfferController.js';

import { 
  getAllCategoryOffers, 
  getCategoryOfferById, 
  createCategoryOffer, 
  updateCategoryOffer, 
  deleteCategoryOffer 
} from '../controllers/categoryOfferController.js';

import { 
  getAllReferralOffers, 
  getReferralOfferById, 
  createReferralOffer, 
  updateReferralOffer, 
  deleteReferralOffer,
  getActiveReferralOffer
} from '../controllers/referralOfferController.js';

import protectAdmin from '../middlewares/authMiddleware.js'

const router = express.Router();

// Product Offer Routes
router.route('/product')
  .get(protectAdmin , getAllProductOffers)
  .post(protectAdmin, createProductOffer);

router.route('/product/:id')
  .get(protectAdmin, getProductOfferById)
  .put(protectAdmin, updateProductOffer)
  .delete(protectAdmin, deleteProductOffer);

// Category Offer Routes
router.route('/category')
  .get(protectAdmin, getAllCategoryOffers)
  .post(protectAdmin, createCategoryOffer);

router.route('/category/:id')
  .get(protectAdmin, getCategoryOfferById)
  .put(protectAdmin, updateCategoryOffer)
  .delete(protectAdmin, deleteCategoryOffer);

// Referral Offer Routes
router.route('/referral')
  .get(protectAdmin, getAllReferralOffers)
  .post(protectAdmin, createReferralOffer);

router.route('/referral/active')
  .get(protectAdmin, getActiveReferralOffer);

router.route('/referral/:id')
  .get(protectAdmin, getReferralOfferById)
  .put(protectAdmin, updateReferralOffer)
  .delete(protectAdmin , deleteReferralOffer);

export default router;
