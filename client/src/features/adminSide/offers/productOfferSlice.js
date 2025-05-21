import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productOfferService from './productOfferService';

const initialState = {
  productOffers: [],
  productOffer: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  totalOffers: 0,
  totalPages: 0,
  currentPage: 1
};

// Get all product offers
export const getAllProductOffers = createAsyncThunk(
  'productOffer/getAll',
  async (params, thunkAPI) => {
    try {
      return await productOfferService.getAllProductOffers(params);
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get product offer by ID
export const getProductOfferById = createAsyncThunk(
  'productOffer/getById',
  async (id, thunkAPI) => {
    try {
      return await productOfferService.getProductOfferById(id);
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a new product offer
export const createProductOffer = createAsyncThunk(
  'productOffer/create',
  async (offerData, thunkAPI) => {
    try {
      return await productOfferService.createProductOffer(offerData);
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update a product offer
export const updateProductOffer = createAsyncThunk(
  'productOffer/update',
  async ({ id, offerData }, thunkAPI) => {
    try {
      return await productOfferService.updateProductOffer(id, offerData);
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete a product offer
export const deleteProductOffer = createAsyncThunk(
  'productOffer/delete',
  async (id, thunkAPI) => {
    try {
      await productOfferService.deleteProductOffer(id);
      return id;
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const productOfferSlice = createSlice({
  name: 'productOffer',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearProductOffer: (state) => {
      state.productOffer = null;
    },
    resetForm: (state) => {
      // This is a more comprehensive reset for when navigating to the form
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
      state.productOffer = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all product offers
      .addCase(getAllProductOffers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllProductOffers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.productOffers = action.payload.offers;
        state.totalOffers = action.payload.total;
        state.totalPages = action.payload.pages;
        state.currentPage = action.payload.page;
      })
      .addCase(getAllProductOffers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get product offer by ID
      .addCase(getProductOfferById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProductOfferById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.productOffer = action.payload;
      })
      .addCase(getProductOfferById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create a new product offer
      .addCase(createProductOffer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createProductOffer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.productOffers.push(action.payload);
      })
      .addCase(createProductOffer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update a product offer
      .addCase(updateProductOffer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProductOffer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.productOffer = action.payload;
        state.productOffers = state.productOffers.map(offer => 
          offer._id === action.payload._id ? action.payload : offer
        );
      })
      .addCase(updateProductOffer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete a product offer
      .addCase(deleteProductOffer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteProductOffer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.productOffers = state.productOffers.filter(
          offer => offer._id !== action.payload
        );
      })
      .addCase(deleteProductOffer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset, clearProductOffer, resetForm } = productOfferSlice.actions;
export default productOfferSlice.reducer;
