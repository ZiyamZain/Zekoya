import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminCouponService from './adminCouponService';

const initialState = {
    coupons: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: ''
};

export const createCoupon = createAsyncThunk(
    'adminCoupon/create',
    async(couponData, thunkAPI) => {
        try {
            const token = thunkAPI.getState().adminAuth.adminInfo.token;
            return await adminCouponService.createCoupon(couponData, token);
        } catch(error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const getAllCoupons = createAsyncThunk(
    'adminCoupon/getAll',
    async(_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().adminAuth.adminInfo.token;
            return await adminCouponService.getAllCoupons(token);
        } catch(error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const updateCoupon = createAsyncThunk(
    'adminCoupon/update',
    async({couponId, couponData}, thunkAPI) => {
        try {
            const token = thunkAPI.getState().adminAuth.adminInfo.token;
            return await adminCouponService.updateCoupon(couponId, couponData, token);
        } catch(error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const deleteCoupon = createAsyncThunk(
    'adminCoupon/delete',
    async(couponId, thunkAPI) => {
        try {
            const token = thunkAPI.getState().adminAuth.adminInfo.token;
            return await adminCouponService.deleteCoupon(couponId, token);
        } catch(error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const adminCouponSlice = createSlice({
    name: 'adminCoupon',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createCoupon.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createCoupon.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.message = 'Coupon created successfully';
                state.coupons.push(action.payload);
            })
            .addCase(createCoupon.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getAllCoupons.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAllCoupons.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = false; // Set to false to prevent toast on initial load
                state.coupons = action.payload;
            })
            .addCase(getAllCoupons.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(updateCoupon.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateCoupon.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.message = 'Coupon updated successfully';
                state.coupons = state.coupons.map((coupon) =>
                    coupon._id === action.payload._id ? action.payload : coupon
                );
            })
            .addCase(updateCoupon.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(deleteCoupon.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteCoupon.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.message = 'Coupon deleted successfully';
                state.coupons = state.coupons.filter((coupon) => coupon._id !== action.payload.id);
            })
            .addCase(deleteCoupon.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { reset } = adminCouponSlice.actions;
export default adminCouponSlice.reducer;
