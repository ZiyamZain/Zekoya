import axios from 'axios';
import API from '../../utils/axiosConfig';

// User-only coupon service - only handles validation
const validateCoupon = async({ code, orderAmount }, token) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        
        const response = await API.post('/api/coupons/validate', { 
            code, 
            orderAmount: parseFloat(orderAmount) 
        }, config);
        
        return response.data;
    } catch (error) {
        console.error('Error validating coupon:', error.response?.data || error.message);
        throw error;
    }
}

// Get available coupons for a given order amount
const getAvailableCoupons = async(orderAmount, token) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        
        const response = await API.get(
            `/api/coupons/available?orderAmount=${parseFloat(orderAmount)}`,
            config
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