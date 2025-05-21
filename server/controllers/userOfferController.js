import ProductOffer from '../models/productOfferModel.js';
import CategoryOffer from '../models/categoryOfferModel.js';
import ReferralOffer from '../models/referralOfferModel.js';

// Get all active offers for users
export const getAllActiveOffers = async (req, res) => {
  try {
    const now = new Date();
    
    // Get active product offers
    const productOffers = await ProductOffer.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate('product', 'name images price');
    
    // Get active category offers
    const categoryOffers = await CategoryOffer.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate('category', 'name');
    
    // Get active referral offers
    const referralOffers = await ReferralOffer.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });
    
    res.status(200).json({
      productOffers,
      categoryOffers,
      referralOffers
    });
  } catch (error) {
    console.error('Error fetching active offers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
