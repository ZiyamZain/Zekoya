import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminCouponService from './adminCouponService';

const initialState = {
    coupons: [],
    coupon: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: ''
};

// Create new coupon
export const createCoupon = createAsyncThunk(
    'adminCoupon/create',
    async (couponData, thunkAPI) => {
        try {
            const token = thunkAPI.getState().adminAuth.adminInfo?.token;
            return await adminCouponService.createCoupon(couponData, token);
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);


// Get all coupons
export const getAllCoupons = createAsyncThunk(
    'adminCoupon/getAll',
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().adminAuth.adminInfo?.token;
            return await adminCouponService.getAllCoupons(token);
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Get coupon by ID
export const getCouponById = createAsyncThunk(
    'adminCoupon/getById',
    async (couponId, thunkAPI) => {
        try {
            const token = thunkAPI.getState().adminAuth.adminInfo?.token;
            return await adminCouponService.getCouponById(couponId, token);
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);


// Update coupon
export const updateCoupon = createAsyncThunk(
    'adminCoupon/update',
    async ({ couponId, couponData }, thunkAPI) => {
        try {
            const token = thunkAPI.getState().adminAuth.adminInfo?.token;
            return await adminCouponService.updateCoupon(couponId, couponData, token);
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Delete coupon
export const deleteCoupon = createAsyncThunk(
    'adminCoupon/delete',
    async (couponId, thunkAPI) => {
        try {
            const token = thunkAPI.getState().adminAuth.adminInfo?.token;
            return await adminCouponService.deleteCoupon(couponId, token);
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const adminCouponSlice = createSlice({
    name: 'adminCoupon',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        },
        clearCoupon: (state) => {
            state.coupon = null;
        },
        resetAll: (state) => {
            return initialState;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create coupon
            .addCase(createCoupon.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createCoupon.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.coupons.push(action.payload);
            })
            .addCase(createCoupon.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Get all coupons
            .addCase(getAllCoupons.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAllCoupons.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.coupons = action.payload;
            })
            .addCase(getAllCoupons.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Get coupon by ID
            .addCase(getCouponById.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getCouponById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.coupon = action.payload;
            })
            .addCase(getCouponById.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Update coupon
            .addCase(updateCoupon.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateCoupon.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.coupons = state.coupons.map(coupon => 
                    coupon._id === action.payload._id ? action.payload : coupon
                );
                state.coupon = action.payload;
            })
            .addCase(updateCoupon.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Delete coupon
            .addCase(deleteCoupon.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteCoupon.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.coupons = state.coupons.filter(coupon => 
                    coupon._id !== action.payload.id
                );
            })
            .addCase(deleteCoupon.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { reset, clearCoupon, resetAll } = adminCouponSlice.actions;
export default adminCouponSlice.reducer;
