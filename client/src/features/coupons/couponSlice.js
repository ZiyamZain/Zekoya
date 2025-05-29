import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import couponService from './couponService.js';

// Simplified user coupon slice - only handles validation
const initialState = {
    activeCoupon: null,
    availableCoupons: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: ''
};

export const validateCoupon = createAsyncThunk(
    'coupon/validate',
    async(couponData, thunkAPI) => {
        try {
            const token = thunkAPI.getState().userAuth.userInfo.token;
            return await couponService.validateCoupon(couponData, token);
        }
        catch(error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const getAvailableCoupons = createAsyncThunk(
    'coupon/getAvailable',
    async(orderAmount, thunkAPI) => {
        try {
            const token = thunkAPI.getState().userAuth.userInfo.token;
            return await couponService.getAvailableCoupons(orderAmount, token);
        } catch(error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);


export const couponSlice = createSlice({
    name: 'coupon',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        },
        clearActiveCoupon: (state) => {
            state.activeCoupon = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(validateCoupon.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(validateCoupon.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.activeCoupon = action.payload;
            })
            .addCase(validateCoupon.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getAvailableCoupons.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAvailableCoupons.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.availableCoupons = action.payload;
            })
            .addCase(getAvailableCoupons.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { reset, clearActiveCoupon } = couponSlice.actions;
export default couponSlice.reducer;