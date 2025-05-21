import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import referralOfferService from './referralOfferService';

const initialState = {
  referralOffers: [],
  referralOffer: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  totalOffers: 0,
  totalPages: 0,
  currentPage: 1
};

// Get all referral offers
export const getAllReferralOffers = createAsyncThunk(
  'referralOffer/getAll',
  async (params, thunkAPI) => {
    try {
      return await referralOfferService.getAllReferralOffers(params);
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get referral offer by ID
export const getReferralOfferById = createAsyncThunk(
  'referralOffer/getById',
  async (id, thunkAPI) => {
    try {
      return await referralOfferService.getReferralOfferById(id);
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create referral offer
export const createReferralOffer = createAsyncThunk(
  'referralOffer/create',
  async (offerData, thunkAPI) => {
    try {
      return await referralOfferService.createReferralOffer(offerData);
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update referral offer
export const updateReferralOffer = createAsyncThunk(
  'referralOffer/update',
  async ({ id, offerData }, thunkAPI) => {
    try {
      return await referralOfferService.updateReferralOffer(id, offerData);
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete referral offer
export const deleteReferralOffer = createAsyncThunk(
  'referralOffer/delete',
  async (id, thunkAPI) => {
    try {
      return await referralOfferService.deleteReferralOffer(id);
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const referralOfferSlice = createSlice({
  name: 'referralOffer',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearReferralOffer: (state) => {
      state.referralOffer = null;
    },
    resetForm: (state) => {
      // This is a more comprehensive reset for when navigating to the form
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
      state.referralOffer = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all referral offers
      .addCase(getAllReferralOffers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllReferralOffers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.referralOffers = action.payload.offers;
        state.totalOffers = action.payload.totalOffers;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(getAllReferralOffers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get referral offer by ID
      .addCase(getReferralOfferById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getReferralOfferById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.referralOffer = action.payload;
      })
      .addCase(getReferralOfferById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Create referral offer
      .addCase(createReferralOffer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createReferralOffer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.referralOffer = action.payload;
      })
      .addCase(createReferralOffer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update referral offer
      .addCase(updateReferralOffer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateReferralOffer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.referralOffer = action.payload;
      })
      .addCase(updateReferralOffer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Delete referral offer
      .addCase(deleteReferralOffer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteReferralOffer.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(deleteReferralOffer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset, clearReferralOffer, resetForm } = referralOfferSlice.actions;
export default referralOfferSlice.reducer;
