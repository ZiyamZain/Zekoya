import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import cartService from "./cartService";

// Load cart from localStorage if available
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : null;
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return null;
  }
};

const initialState = {
  cart: loadCartFromStorage(),
  hasUnavailableItems: false,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

// Get user cart
export const getCart = createAsyncThunk("cart/getCart", async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().userAuth.userInfo.token;
    return await cartService.getCart(token);
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Add item to cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (cartData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().userAuth.userInfo.token;
      return await cartService.addToCart(cartData, token);
    } catch (error) {
      // Handle different error types from the backend
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        // If it's a duplicate item error, include the existing item ID in the error payload
        if (errorData.errorType === 'duplicateItem') {
          return thunkAPI.rejectWithValue({
            message: errorData.message,
            errorType: errorData.errorType,
            existingItem: errorData.existingItem
          });
        }
        
        // For other error types, just include the message and type
        if (errorData.errorType) {
          return thunkAPI.rejectWithValue({
            message: errorData.message,
            errorType: errorData.errorType
          });
        }
        
        // For standard errors with just a message
        if (errorData.message) {
          return thunkAPI.rejectWithValue({
            message: errorData.message
          });
        }
      }
      
      // Fallback for unexpected errors
      return thunkAPI.rejectWithValue({
        message: error.message || 'An unexpected error occurred'
      });
    }
  }
);

// Update cart item
export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async (itemData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().userAuth.userInfo.token;
      return await cartService.updateCartItem(itemData, token);
    } catch (error) {
      // Handle different error types from the backend
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        // If it's a maximum quantity error, include the max quantity in the error payload
        if (errorData.errorType === 'maxQuantity') {
          return thunkAPI.rejectWithValue({
            message: errorData.message,
            errorType: errorData.errorType,
            maxQuantity: errorData.maxQuantity
          });
        }
        
        // For other error types, just include the message and type
        if (errorData.errorType) {
          return thunkAPI.rejectWithValue({
            message: errorData.message,
            errorType: errorData.errorType
          });
        }
        
        // For standard errors with just a message
        if (errorData.message) {
          return thunkAPI.rejectWithValue({
            message: errorData.message
          });
        }
      }
      
      // Fallback for unexpected errors
      return thunkAPI.rejectWithValue({
        message: error.message || 'An unexpected error occurred'
      });
    }
  }
);

// Remove item from cart
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (itemId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().userAuth.userInfo.token;
      return await cartService.removeFromCart(itemId, token);
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCart: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
    clearCart: (state) => {
      state.cart = null;
      // Clear cart from localStorage
      localStorage.removeItem('cart');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.cart = action.payload.cart;
        state.hasUnavailableItems = action.payload.hasUnavailableItems;
        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(action.payload.cart));
      })
      .addCase(getCart.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.cart = action.payload.cart;
        state.hasUnavailableItems = action.payload.hasUnavailableItems || false;
        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(action.payload.cart));
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        // Handle different error payload formats
        if (action.payload && typeof action.payload === 'object') {
          state.message = action.payload.message || 'Error adding to cart';
          state.errorType = action.payload.errorType || null;
          state.errorData = action.payload;
        } else {
          state.message = action.payload || 'Error adding to cart';
          state.errorType = null;
          state.errorData = null;
        }
      })
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.cart = action.payload.cart;
        state.hasUnavailableItems = action.payload.hasUnavailableItems || false;
        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(action.payload.cart));
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        // Handle different error payload formats
        if (action.payload && typeof action.payload === 'object') {
          state.message = action.payload.message || 'Error updating cart';
          state.errorType = action.payload.errorType || null;
          state.errorData = action.payload;
        } else {
          state.message = action.payload || 'Error updating cart';
          state.errorType = null;
          state.errorData = null;
        }
      })
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.cart = action.payload.cart;
        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(action.payload.cart));
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
