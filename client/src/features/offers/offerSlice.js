import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import offerService from './offerService';

const initialState = {
  activeOffer: null,
  activeCategoryOffer: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
};

// Get active offer for a product
export const getActiveOfferForProduct = createAsyncThunk(
  'offer/getActiveForProduct',
  async (productId, thunkAPI) => {
    try {
      return await offerService.getActiveOfferForProduct(productId);
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch offer';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get active offer for a category
export const getActiveOfferForCategory = createAsyncThunk(
  'offer/getActiveForCategory',
  async (categoryId, thunkAPI) => {
    try {
      return await offerService.getActiveOfferForCategory(categoryId);
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch category offer';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const offerSlice = createSlice({
  name: 'offer',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearActiveOffer: (state) => {
      state.activeOffer = null;
      state.activeCategoryOffer = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getActiveOfferForProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getActiveOfferForProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.activeOffer = action.payload;
      })
      .addCase(getActiveOfferForProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.activeOffer = null;
      })
      .addCase(getActiveOfferForCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getActiveOfferForCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.activeCategoryOffer = action.payload;
      })
      .addCase(getActiveOfferForCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.activeCategoryOffer = null;
      });
  }
});

export const { reset, clearActiveOffer } = offerSlice.actions;
export default offerSlice.reducer;
