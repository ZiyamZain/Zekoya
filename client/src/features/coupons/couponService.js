import { couponAxios } from '../../utils/userAxiosConfig';

// User-only coupon service - only handles validation
const validateCoupon = async({ code, orderAmount }) => {
    try {
        // couponAxios will automatically add auth header
        const response = await couponAxios.post('/validate', { 
            code, 
            orderAmount: parseFloat(orderAmount) 
        });
        
        return response.data;
    } catch (error) {
        console.error('Error validating coupon:', error.response?.data || error.message);
        throw error;
    }
}

// Get available coupons for a given order amount
const getAvailableCoupons = async(orderAmount) => {
    try {
        // couponAxios will automatically add auth header
        const response = await couponAxios.get(
            `/available?orderAmount=${parseFloat(orderAmount)}`
        );
        
        return response.data;
    } catch (error) {
        console.error('Error fetching available coupons:', error.response?.data || error.message);
        throw error;
    }
}

const couponService = {
    validateCoupon,
    getAvailableCoupons
}

export default couponService;