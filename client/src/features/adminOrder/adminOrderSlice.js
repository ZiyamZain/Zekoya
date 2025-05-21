import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminOrderService from "./adminOrderService";

const initialState = {
  orders: [],
  order: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
  totalOrders: 0,
  totalPages: 0,
  currentPage: 1,
};

// Get all orders
export const getAllOrders = createAsyncThunk(
  "adminOrder/getAll",
  async (params, thunkAPI) => {
    try {
      const result = await adminOrderService.getAllOrders(params);
      return result;
    } catch (error) {
      console.error('getAllOrders thunk error:', error);
      const message = error?.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get order details
export const getOrderDetails = createAsyncThunk(
  "adminOrder/getDetails",
  async (id, thunkAPI) => {
    try {
      return await adminOrderService.getOrderDetails(id);
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  "adminOrder/updateStatus",
  async (data, thunkAPI) => {
    try {
      return await adminOrderService.updateOrderStatus(data);
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Process return request
export const processReturnRequest = createAsyncThunk(
  "adminOrder/processReturn",
  async (data, thunkAPI) => {
    try {
      return await adminOrderService.processReturnRequest(data);
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Generate invoice
export const generateInvoice = createAsyncThunk(
  "adminOrder/generateInvoice",
  async (orderId, thunkAPI) => {
    try {
      return await adminOrderService.generateInvoice(orderId);
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const adminOrderSlice = createSlice({
  name: "adminOrder",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
    resetPage: (state) => {
      // Reset to page 1 after processing an order
      state.currentPage = 1;
    },
    refreshOrders: (state) => {
      // This action will be dispatched after processing an order
      // The actual refresh will happen via the useEffect in the component
      state.refreshTrigger = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all orders
      .addCase(getAllOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.orders = action.payload.orders;
        state.totalOrders = action.payload.total;
        state.totalPages = action.payload.pages;
        state.currentPage = action.payload.page;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get order details
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.order = action.payload;
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.order = action.payload.order;
        state.message = action.payload.message;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Process return request
      .addCase(processReturnRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(processReturnRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.order = action.payload.order;
        state.message = action.payload.message;
      })
      .addCase(processReturnRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, resetPage, refreshOrders } = adminOrderSlice.actions;
export default adminOrderSlice.reducer;
