import adminAxios from '../../../utils/adminAxiosConfig';

// Admin-only coupon service - handles CRUD operations
const createCoupon = async (couponData) => {
    try {
        // adminAxios will automatically add auth header
        const response = await adminAxios.post('/coupons/create', couponData);
        return response.data;
    } catch (error) {
        console.error('Error creating coupon:', error.response?.data || error.message);
        throw error;
    }
};

const getAllCoupons = async () => {
    try {
        // adminAxios will automatically add auth header
        const response = await adminAxios.get('/coupons/all');
        return response.data;
    } catch (error) {
        console.error('Error fetching all coupons:', error.response?.data || error.message);
        throw error;
    }
};

const getCouponById = async (couponId) => {
    try {
        // adminAxios will automatically add auth header
        const response = await adminAxios.get(`/coupons/${couponId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching coupon by ID:', error.response?.data || error.message);
        throw error;
    }
};


const updateCoupon = async (couponId, couponData) => {
    try {
        // adminAxios will automatically add auth header
        const response = await adminAxios.put(`/coupons/${couponId}/update`, couponData);
        return response.data;
    } catch (error) {
        console.error('Error updating coupon:', error.response?.data || error.message);
        throw error;
    }
};


const deleteCoupon = async (couponId) => {
    try {
        // adminAxios will automatically add auth header
        const response = await adminAxios.delete(`/coupons/${couponId}/delete`);
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
