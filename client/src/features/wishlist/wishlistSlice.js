import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import wishlistService from "./wishlistService";

const initialState = {
  wishlist: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

// Get user wishlist
export const getWishlist = createAsyncThunk(
  "wishlist/getWishlist",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().userAuth.userInfo.token;
      return await wishlistService.getWishlist(token);
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add product to wishlist
export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (productId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().userAuth.userInfo.token;
      return await wishlistService.addToWishlist(productId, token);
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Remove product from wishlist
export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (productId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().userAuth.userInfo.token;
      return await wishlistService.removeFromWishlist(productId, token);
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    resetWishlist: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
    clearWishlist: (state) => {
      state.wishlist = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getWishlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.wishlist = action.payload;
      })
      .addCase(getWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(addToWishlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.wishlist = action.payload;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(removeFromWishlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.wishlist = action.payload;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
