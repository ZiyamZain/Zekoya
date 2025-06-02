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

import adminProtect from '../middlewares/adminProtect.js'

const router = express.Router();

// Product Offer Routes
router.route('/product')
  .get(adminProtect , getAllProductOffers)
  .post(adminProtect, createProductOffer);

router.route('/product/:id')
  .get(adminProtect, getProductOfferById)
  .put(adminProtect, updateProductOffer)
  .delete(adminProtect, deleteProductOffer);

// Category Offer Routes
router.route('/category')
  .get(adminProtect, getAllCategoryOffers)
  .post(adminProtect, createCategoryOffer);

router.route('/category/:id')
  .get(adminProtect, getCategoryOfferById)
  .put(adminProtect, updateCategoryOffer)
  .delete(adminProtect, deleteCategoryOffer);

// Referral Offer Routes
router.route('/referral')
  .get(adminProtect, getAllReferralOffers)
  .post(adminProtect, createReferralOffer);

router.route('/referral/active')
  .get(adminProtect, getActiveReferralOffer);

router.route('/referral/:id')
  .get(adminProtect, getReferralOfferById)
  .put(adminProtect, updateReferralOffer)
  .delete(adminProtect , deleteReferralOffer);

export default router;
