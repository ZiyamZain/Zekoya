import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentService from './paymentService';

const initialState = {
  razorpayKey: null,
  razorpayOrder: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
};

// Get Razorpay key
export const getRazorpayKey = createAsyncThunk(
  'payment/getRazorpayKey',
  async (_, thunkAPI) => {
    try {
      return await paymentService.getRazorpayKey();
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create Razorpay order
export const createPaymentOrder = createAsyncThunk(
  'payment/createOrder',
  async (orderData, thunkAPI) => {
    try {
      return await paymentService.createOrder(orderData);
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Verify payment
export const verifyPayment = createAsyncThunk(
  'payment/verifyPayment',
  async (paymentData, thunkAPI) => {
    try {
      return await paymentService.verifyPayment(paymentData);
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const paymentSlice = createSlice({
  name: 'payment',
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
      // Get Razorpay key
      .addCase(getRazorpayKey.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRazorpayKey.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.razorpayKey = action.payload.key_id;
      })
      .addCase(getRazorpayKey.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create Razorpay order
      .addCase(createPaymentOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPaymentOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.razorpayOrder = action.payload.order;
      })
      .addCase(createPaymentOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Verify payment
      .addCase(verifyPayment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyPayment.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset } = paymentSlice.actions;
export default paymentSlice.reducer;
