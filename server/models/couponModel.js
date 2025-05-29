import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code:{
        type:String,
        required:true,
        unique:true,
        uppercase:true,
        trim:true
    },
    description:{
        type:String , 
        required:true
    },
    discountType:{
        type:String,
        enum:['percentage' , 'fixed'],
        required:true
    },
    discountValue:{
        type:Number,
        required:true,
        min:0
    },
    minPurchase:{
        type:Number,
        default:0
    },
    maxDiscount:{
        type:Number,
        default:null
    },
    startDate:{
        type:Date,
        required:true
    },
    endDate:{
        type:Date,
        required:true
    },
    usageLimit:{
        type:Number,
        default:null
    },
    usedCount:{
        type:Number,
        default:0
    },
    isActive:{
        type:Boolean,
        default:true
    }
    
},{timestamps:true})


couponSchema.pre('save' , function(next){
    if(this.endDate <= this.startDate){
        next(new Error('End date must be after start date'));
    }
    next();
})

couponSchema.methods.isValid = function(orderAmount){
    const now = new Date();
    
    if (!this.isActive) {
        return { isValid: false, message: 'This coupon is not active' };
    }
    if (now < this.startDate) {
        return { isValid: false, message: 'This coupon is not yet valid' };
    }
    
    if (now > this.endDate) {
        return { isValid: false, message: 'This coupon has expired' };
    }
    if (orderAmount < this.minPurchase) {
        return { isValid: false, message: `Minimum purchase of ₹${this.minPurchase} required for this coupon` };
    }
    
    if (this.usageLimit && this.usedCount >= this.usageLimit) {
        return { isValid: false, message: 'This coupon has reached its usage limit' };
    }

    return { isValid: true, message: 'Coupon is valid' };
}

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;