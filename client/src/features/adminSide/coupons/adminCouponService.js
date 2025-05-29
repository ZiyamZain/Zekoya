import axios from 'axios';
import API from '../../../utils/axiosConfig';

// Admin-only coupon service - handles CRUD operations
const createCoupon = async (couponData, token) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        
        const response = await API.post('/api/admin/coupons/create', couponData, config);
        return response.data;
    } catch (error) {
        console.error('Error creating coupon:', error.response?.data || error.message);
        throw error;
    }
};

const getAllCoupons = async (token) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        
        const response = await API.get('/api/admin/coupons/all', config);
        return response.data;
    } catch (error) {
        console.error('Error fetching all coupons:', error.response?.data || error.message);
        throw error;
    }
};

const getCouponById = async (couponId, token) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        
        const response = await API.get(`/api/admin/coupons/${couponId}`, config);
        return response.data;
    } catch (error) {
        console.error('Error fetching coupon by ID:', error.response?.data || error.message);
        throw error;
    }
};


const updateCoupon = async (couponId, couponData, token) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        
        const response = await API.put(`/api/admin/coupons/${couponId}/update`, couponData, config);
        return response.data;
    } catch (error) {
        console.error('Error updating coupon:', error.response?.data || error.message);
        throw error;
    }
};


const deleteCoupon = async (couponId, token) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        
        const response = await API.delete(`/api/admin/coupons/${couponId}/delete`, config);
        return response.data;
    } catch (error) {
        console.error('Error deleting coupon:', error.response?.data || error.message);
        throw error;
    }
};


const adminCouponService = {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon
};


export default adminCouponService;
