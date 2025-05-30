import ReferralOffer from '../models/referralOfferModel.js';
import Referral from '../models/referralModel.js';
import User from '../models/userModel.js';
import Coupon from '../models/couponModel.js';
import mongoose from 'mongoose';


export const getAllReferralOffers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const offers = await ReferralOffer.find()
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await ReferralOffer.countDocuments();
    
    res.status(200).json({
      offers,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Error fetching referral offers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get referral offer by ID
export const getReferralOfferById = async (req, res) => {
  try {
    const offer = await ReferralOffer.findById(req.params.id)
      .populate('createdBy', 'email');
    
    if (!offer) {
      return res.status(404).json({ message: 'Referral offer not found' });
    }
    
    res.status(200).json(offer);
  } catch (error) {
    console.error('Error fetching referral offer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new referral offer
export const createReferralOffer = async (req, res) => {
  try {
    const { 
      rewardType, 
      rewardValue, 
      couponCode, 
      description, 
      startDate, 
      endDate, 
      minPurchaseAmount, 
      maxReferrals, 
      isActive 
    } = req.body;
    
    // Validate coupon exists if reward type is coupon
    if (rewardType === 'coupon' && couponCode) {
      const couponExists = await Coupon.findOne({ code: couponCode });
      if (!couponExists) {
        return res.status(404).json({ message: 'Coupon not found' });
      }
    }
    
    // Check if there's already an active referral offer
    const existingOffer = await ReferralOffer.findOne({
      isActive: true,
      $or: [
        // New offer starts during existing offer
        {
          startDate: { $lte: new Date(startDate) },
          endDate: { $gte: new Date(startDate) }
        },
        // New offer ends during existing offer
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(endDate) }
        },
        // New offer completely encompasses existing offer
        {
          startDate: { $gte: new Date(startDate) },
          endDate: { $lte: new Date(endDate) }
        }
      ]
    });
    
    if (existingOffer) {
      return res.status(400).json({ 
        message: 'An active referral offer already exists during the specified date range' 
      });
    }
    
    // Create new offer
    // Extract name from request body or generate a default name
    const name = req.body.name || `Referral Offer ${new Date().toISOString().split('T')[0]}`;
    
    const newOffer = new ReferralOffer({
      name, // Add the name field
      rewardType,
      rewardValue,
      couponCode,
      description,
      startDate,
      endDate,
      minPurchaseAmount: minPurchaseAmount || 0,
      maxReferrals: maxReferrals || null,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.admin._id
    });
    
    const savedOffer = await newOffer.save();
    
    res.status(201).json(savedOffer);
  } catch (error) {
    console.error('Error creating referral offer:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a referral offer
export const updateReferralOffer = async (req, res) => {
  try {
    const { 
      rewardType, 
      rewardValue, 
      couponCode, 
      description, 
      startDate, 
      endDate, 
      minPurchaseAmount, 
      maxReferrals, 
      isActive 
    } = req.body;
    
    const offer = await ReferralOffer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Referral offer not found' });
    }
    
    // Validate coupon exists if reward type is being changed to coupon
    if (rewardType === 'coupon' && couponCode) {
      const couponExists = await Coupon.findOne({ code: couponCode });
      if (!couponExists) {
        return res.status(404).json({ message: 'Coupon not found' });
      }
    }
    
    // Check if there's already another active referral offer
    if (isActive && isActive !== offer.isActive) {
      const existingOffer = await ReferralOffer.findOne({
        _id: { $ne: req.params.id },
        isActive: true,
        $or: [
          // New offer starts during existing offer
          {
            startDate: { $lte: new Date(startDate || offer.startDate) },
            endDate: { $gte: new Date(startDate || offer.startDate) }
          },
          // New offer ends during existing offer
          {
            startDate: { $lte: new Date(endDate || offer.endDate) },
            endDate: { $gte: new Date(endDate || offer.endDate) }
          },
          // New offer completely encompasses existing offer
          {
            startDate: { $gte: new Date(startDate || offer.startDate) },
            endDate: { $lte: new Date(endDate || offer.endDate) }
          }
        ]
      });
      
      if (existingOffer) {
        return res.status(400).json({ 
          message: 'An active referral offer already exists during the specified date range' 
        });
      }
    }
    
    // Update offer fields
    if (rewardType) offer.rewardType = rewardType;
    if (rewardValue !== undefined) offer.rewardValue = rewardValue;
    if (couponCode) offer.couponCode = couponCode;
    if (description) offer.description = description;
    if (startDate) offer.startDate = startDate;
    if (endDate) offer.endDate = endDate;
    if (minPurchaseAmount !== undefined) offer.minPurchaseAmount = minPurchaseAmount;
    if (maxReferrals !== undefined) offer.maxReferrals = maxReferrals;
    if (isActive !== undefined) offer.isActive = isActive;
    
    const updatedOffer = await offer.save();
    
    res.status(200).json(updatedOffer);
  } catch (error) {
    console.error('Error updating referral offer:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a referral offer
export const deleteReferralOffer = async (req, res) => {
  try {
    const offer = await ReferralOffer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ message: 'Referral offer not found' });
    }
    
    await offer.deleteOne();
    
    res.status(200).json({ message: 'Referral offer deleted successfully' });
  } catch (error) {
    console.error('Error deleting referral offer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current active referral offer
export const getActiveReferralOffer = async (req, res) => {
  try {
    const now = new Date();
    
    const offer = await ReferralOffer.findOne({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });
    
    if (!offer) {
      return res.status(404).json({ message: 'No active referral offer found' });
    }
    
    res.status(200).json(offer);
  } catch (error) {
    console.error('Error fetching active referral offer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Process a referral
export const processReferral = async (req, res) => {
  try {
    const { referralCode, userId } = req.body;
    
    if (!referralCode || !userId) {
      return res.status(400).json({ message: 'Referral code and user ID are required' });
    }
    
    // Find the referrer by referral code
    const referrer = await User.findOne({ referralCode });
    
    if (!referrer) {
      return res.status(404).json({ message: 'Invalid referral code' });
    }
    
    // Find the referred user
    const referredUser = await User.findById(userId);
    
    if (!referredUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if the user is trying to refer themselves
    if (referrer._id.toString() === referredUser._id.toString()) {
      return res.status(400).json({ message: 'You cannot refer yourself' });
    }
    
    // Check if this referral already exists
    const existingReferral = await Referral.findOne({
      referrer: referrer._id,
      referred: referredUser._id
    });
    
    if (existingReferral) {
      return res.status(400).json({ message: 'This referral has already been processed' });
    }
    
    // Get the active referral offer
    const now = new Date();
    const activeOffer = await ReferralOffer.findOne({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });
    
    if (!activeOffer) {
      return res.status(404).json({ message: 'No active referral offer found' });
    }
    
    // Check if referrer has reached the maximum referrals limit
    if (activeOffer.maxReferrals) {
      const referralCount = await Referral.countDocuments({
        referrer: referrer._id,
        referralOffer: activeOffer._id
      });
      
      if (referralCount >= activeOffer.maxReferrals) {
        return res.status(400).json({ 
          message: `Referrer has reached the maximum limit of ${activeOffer.maxReferrals} referrals for this offer` 
        });
      }
    }
    
    // Create a new referral record
    const newReferral = new Referral({
      referrer: referrer._id,
      referred: referredUser._id,
      referralCode,
      status: 'pending',
      referralOffer: activeOffer._id
    });
    
    await newReferral.save();
    
    // Update the referred user with the referrer information
    referredUser.referredBy = referrer._id;
    await referredUser.save();
    
    res.status(201).json({
      message: 'Referral processed successfully',
      referral: newReferral
    });
  } catch (error) {
    console.error('Error processing referral:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
