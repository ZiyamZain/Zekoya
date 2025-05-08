import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import orderService from "./orderService";

const initialState = {
  orders: [],
  order: null,

  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

// Create new order
export const createOrder = createAsyncThunk(
  "order/create",
  async (orderData, thunkAPI) => {
    try {
      return await orderService.createOrder(orderData);
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get order details
export const getOrderDetails = createAsyncThunk(
  "order/getDetails",
  async (id, thunkAPI) => {
    try {
      return await orderService.getOrderDetails(id);
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get my orders
export const getMyOrders = createAsyncThunk(
  "order/getMyOrders",
  async (params, thunkAPI) => {
    try {
      return await orderService.getMyOrders(params);
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Cancel entire order
export const cancelOrder = createAsyncThunk(
  "order/cancelOrder",
  async (data, thunkAPI) => {
    try {
      return await orderService.cancelOrder(data);
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Cancel order item
export const cancelOrderItem = createAsyncThunk(
  "order/cancelOrderItem",
  async (data, thunkAPI) => {
    try {
      return await orderService.cancelOrderItem(data);
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Request return for item
export const requestReturnItem = createAsyncThunk(
  "order/requestReturnItem",
  async (data, thunkAPI) => {
    try {
      return await orderService.requestReturnItem(data);
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Generate invoice
export const generateInvoice = createAsyncThunk(
  "order/generateInvoice",
  async (orderId, thunkAPI) => {
    try {
      const data = await orderService.generateInvoice(orderId);
      // Create a blob from the PDF data
      const blob = new Blob([data], { type: 'application/pdf' });
      // Create a link element, set the download attribute, and click it
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `invoice-${orderId}.pdf`;
      link.click();
      return orderId;
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Admin: Get all orders
export const getAllOrders = createAsyncThunk(
  "order/getAllOrders",
  async (params, thunkAPI) => {
    try {
      return await orderService.getAllOrders(params);
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Admin: Update order status
export const updateOrderStatus = createAsyncThunk(
  "order/updateOrderStatus",
  async (data, thunkAPI) => {
    try {
      return await orderService.updateOrderStatus(data);
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    resetOrder: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
    clearOrder: (state) => {
      state.order = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.order = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
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
      // Get my orders
      .addCase(getMyOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.orders = action.payload;
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cancelOrder.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Cancel order item
      .addCase(cancelOrderItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cancelOrderItem.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(cancelOrderItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Request return item
      .addCase(requestReturnItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(requestReturnItem.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(requestReturnItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Generate invoice
      .addCase(generateInvoice.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(generateInvoice.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(generateInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetOrder, clearOrder } = orderSlice.actions;
export default orderSlice.reducer;
