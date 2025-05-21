import axios from 'axios';
const API_URL = 'http://localhost:5001/api/coupons/';

const createCoupon = async(couponData, token) => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    };
    const response = await axios.post(API_URL, couponData, config);
    return response.data;
};

const getAllCoupons = async(token) => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    };
    const response = await axios.get(`${API_URL}admin`, config);
    return response.data;
}

const updateCoupon = async(couponId, couponData, token) => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    };
    const response = await axios.put(`${API_URL}${couponId}`, couponData, config);
    return response.data;
}

const deleteCoupon = async(couponId, token) => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    };
    const response = await axios.delete(`${API_URL}${couponId}`, config);
    return response.data;
}

const adminCouponService = {
    createCoupon,
    getAllCoupons,
    updateCoupon,
    deleteCoupon
}

export default adminCouponService;
