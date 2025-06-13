import Review from '../models/reviewModel.js';
import mongoose from 'mongoose';

// Get all reviews (admin only)
export const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find({}).populate('user', 'name email');
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server error while fetching reviews' });
    }
};

// Get reviews for a specific product
export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const reviews = await Review.find({ product: productId })
            .populate('user', 'name profileImage')
            .sort({ createdAt: -1 });
            
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching product reviews:', error);
        res.status(500).json({ message: 'Server error while fetching product reviews' });
    }
};

// Submit a new review
export const submitReview = async (req, res) => {
    try {
        // User is guaranteed to be authenticated at this point (handled by protect middleware)
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        const { productId, title, description, starCount } = req.body;
        const userId = req.user._id;

        // Validate required fields
        if (!productId || !title || !description || starCount === undefined) {
            return res.status(400).json({ 
                message: 'Please provide all required fields: productId, title, description, and starCount' 
            });
        }

        // Validate starCount is a number between 1 and 5
        const rating = Number(starCount);
        if (isNaN(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ 
                message: 'Rating must be a number between 1 and 5' 
            });
        }

        // Check if user has already reviewed this product
        const existingReview = await Review.findOne({ 
            user: userId, 
            product: productId 
        });
        
        if (existingReview) {
            return res.status(400).json({ 
                message: 'You have already reviewed this product' 
            });
        }

        // Create new review
        const review = await Review.create({
            user: userId,
            product: productId,
            title: title.trim(),
            description: description.trim(),
            starCount: rating
        });

        // Populate user data for the response
        const populatedReview = await Review.findById(review._id)
            .populate('user', 'name profileImage')
            .populate('product', 'name');
        
        res.status(201).json(populatedReview);
        
    } catch (error) {
        console.error('Error in submitReview:', error);
        
        // Handle specific error types
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ 
                message: 'Validation error', 
                errors: messages 
            });
        } else if (error.name === 'CastError') {
            return res.status(400).json({ 
                message: 'Invalid data format' 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error while submitting review',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
