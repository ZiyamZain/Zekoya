// client/src/features/adminSide/categories/categorySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import categoryService from "./categoryService";

const initialState = {
  categories: [],
  total: 0,
  isLoading: false,
  isError: false,
  message: "",
};

// Get categories
export const getCategories = createAsyncThunk(
  "categories/getAll",
  async (params, thunkAPI) => {
    try {
      const data = await categoryService.getCategories(params);
      // If response is paginated, extract categories and total
      if (data && data.categories && typeof data.total === 'number') {
        return data;
      }
      // If response is array (legacy), wrap in object
      return { categories: Array.isArray(data) ? data : [], total: Array.isArray(data) ? data.length : 0 };
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

// Add category
export const addCategory = createAsyncThunk(
  "categories/add",
  async (formData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().adminAuth.adminInfo.token;
      return await categoryService.addCategory(formData, token);
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

// Update category
export const updateCategory = createAsyncThunk(
  "categories/update",
  async ({ id, formData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().adminAuth.adminInfo.token;
      return await categoryService.updateCategory(id, formData, token);
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

// Delete category
export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().adminAuth.adminInfo.token;
      return await categoryService.deleteCategory(id, token);
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

// Toggle category listing status
export const toggleCategoryListing = createAsyncThunk(
  "categories/toggleListing",
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().adminAuth.adminInfo.token;
      return await categoryService.toggleCategoryListing(id, token);
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

// Update category status
export const updateCategoryStatus = createAsyncThunk(
  "categories/updateStatus",
  async (updatedCategory, thunkAPI) => {
    try {
      const token = thunkAPI.getState().adminAuth.adminInfo.token;
      return await categoryService.updateCategory(updatedCategory._id, updatedCategory, token);
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

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Get categories
      .addCase(getCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload.categories;
        state.total = action.payload.total;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Add category
      .addCase(addCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories.push(action.payload);
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = state.categories.map((category) =>
          category._id === action.payload._id ? action.payload : category
        );
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = state.categories.filter(
          (category) => category._id !== action.payload.id
        );
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Toggle category listing status
      .addCase(toggleCategoryListing.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(toggleCategoryListing.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedCategory = action.payload.category;
        state.categories = state.categories.map((cat) =>
          cat._id === updatedCategory._id ? updatedCategory : cat
        );
      })
      .addCase(toggleCategoryListing.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = categorySlice.actions;
export default categorySlice.reducer;
