import axios from 'axios';
const API_URL = 'http://localhost:5001/api/coupons/';

// User-only coupon service - only handles validation
const validateCoupon = async({ code, orderAmount }, token) =>{
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    };
    const response = await axios.post(`${API_URL}validate`, { code, orderAmount }, config);
    return response.data;
}

const couponService = {
    validateCoupon
}

export default couponService;