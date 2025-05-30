import Coupon from '../models/couponModel.js';
import asyncHandler from 'express-async-handler';


export const createCoupon = asyncHandler(async(req , res) =>{
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
});


export const getAllCoupons = asyncHandler(async (req,res) =>{
    const coupons = await Coupon.find().sort({createdAt: -1});
    res.json(coupons);
 })

 export const getCouponById = asyncHandler(async (req,res) =>{
    const coupon = await Coupon.findById(req.params.id);
    if(!coupon){
        res.status(404);
        throw new Error('Coupon not found');
    }
    res.json(coupon);
 })

 export const updateCoupon = asyncHandler(async (req,res) =>{
    const coupon = await Coupon.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new:true,runValidators:true}
    );
    if(!coupon){
        res.status(404);
        throw new Error("Coupon not found")
    }
    res.json(coupon);
 })

 export const deleteCoupon = asyncHandler (async (req,res) =>{
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if(!coupon){
        res.status(404);
        throw new Error('Coupon not found');
    }
    res.json({message: "Coupon deleted successfully"});
 });


 //validate a coupon

export const validateCoupon = asyncHandler(async(req,res)=>{
    const {code , orderAmount} = req.body;
 
    const coupon = await Coupon.findOne({code:code.toUpperCase()});
    if(!coupon) {
        res.status(404);
        throw new Error('Invalid coupon code');
    }
    
    // Check coupon validity
    const validationResult = coupon.isValid(orderAmount);
    if(!validationResult.isValid){
        res.status(400);
        throw new Error(validationResult.message || 'Coupon is not valid for this order');
    }

    //calculate discount amount
    let discountAmount = 0;
    if(coupon.discountType === 'percentage'){
        discountAmount = (orderAmount * coupon.discountValue) / 100;
        if(coupon.maxDiscount){
            discountAmount = Math.min(discountAmount,coupon.maxDiscount);
        }
    }else{
        discountAmount = coupon.discountValue;
    }
    res.json({
        coupon,
        discountAmount : Math.round(discountAmount * 100) /100
    });
 });
 
// Get available coupons for a given order amount
export const getAvailableCoupons = asyncHandler(async (req, res) => {
    const { orderAmount } = req.query;
    
    if (!orderAmount) {
        res.status(400);
        throw new Error('Order amount is required');
    }

    const now = new Date();
    
    // Find active coupons that are valid for the current date and have not reached usage limit
    const coupons = await Coupon.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
        minPurchase: { $lte: orderAmount },
        $or: [
            { usageLimit: null },
            { $expr: { $lt: ["$usedCount", "$usageLimit"] } }
        ]
    });

    // Calculate discount amount for each coupon
    const availableCoupons = coupons.map(coupon => {
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (orderAmount * coupon.discountValue) / 100;
            if (coupon.maxDiscount) {
                discountAmount = Math.min(discountAmount, coupon.maxDiscount);
            }
        } else {
            discountAmount = coupon.discountValue;
        }
        
        return {
            coupon,
            discountAmount: Math.round(discountAmount * 100) / 100
        };
    });

    // Sort by highest discount amount
    availableCoupons.sort((a, b) => b.discountAmount - a.discountAmount);
    
    res.json(availableCoupons);
});
