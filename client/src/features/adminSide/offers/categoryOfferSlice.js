import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryOfferService from './categoryOfferService';

const initialState = {
  categoryOffers: [],
  categoryOffer: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  totalOffers: 0,
  totalPages: 0,
  currentPage: 1
};

// Get all category offers
export const getAllCategoryOffers = createAsyncThunk(
  'categoryOffer/getAll',
  async (params, thunkAPI) => {
    try {
      return await categoryOfferService.getAllCategoryOffers(params);
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get category offer by ID
export const getCategoryOfferById = createAsyncThunk(
  'categoryOffer/getById',
  async (id, thunkAPI) => {
    try {
      return await categoryOfferService.getCategoryOfferById(id);
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a new category offer
export const createCategoryOffer = createAsyncThunk(
  'categoryOffer/create',
  async (offerData, thunkAPI) => {
    try {
      return await categoryOfferService.createCategoryOffer(offerData);
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update a category offer
export const updateCategoryOffer = createAsyncThunk(
  'categoryOffer/update',
  async ({ id, offerData }, thunkAPI) => {
    try {
      return await categoryOfferService.updateCategoryOffer(id, offerData);
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete a category offer
export const deleteCategoryOffer = createAsyncThunk(
  'categoryOffer/delete',
  async (id, thunkAPI) => {
    try {
      await categoryOfferService.deleteCategoryOffer(id);
      return id;
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const categoryOfferSlice = createSlice({
  name: 'categoryOffer',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearCategoryOffer: (state) => {
      state.categoryOffer = null;
    },
    resetForm: (state) => {
      // This is a more comprehensive reset for when navigating to the form
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
      state.categoryOffer = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all category offers
      .addCase(getAllCategoryOffers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllCategoryOffers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.categoryOffers = action.payload.offers;
        state.totalOffers = action.payload.total;
        state.totalPages = action.payload.pages;
        state.currentPage = action.payload.page;
      })
      .addCase(getAllCategoryOffers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get category offer by ID
      .addCase(getCategoryOfferById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCategoryOfferById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.categoryOffer = action.payload;
      })
      .addCase(getCategoryOfferById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create a new category offer
      .addCase(createCategoryOffer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCategoryOffer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.categoryOffers.push(action.payload);
      })
      .addCase(createCategoryOffer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update a category offer
      .addCase(updateCategoryOffer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCategoryOffer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.categoryOffer = action.payload;
        state.categoryOffers = state.categoryOffers.map(offer => 
          offer._id === action.payload._id ? action.payload : offer
        );
      })
      .addCase(updateCategoryOffer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete a category offer
      .addCase(deleteCategoryOffer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCategoryOffer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.categoryOffers = state.categoryOffers.filter(
          offer => offer._id !== action.payload
        );
      })
      .addCase(deleteCategoryOffer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset, clearCategoryOffer, resetForm } = categoryOfferSlice.actions;
export default categoryOfferSlice.reducer;
