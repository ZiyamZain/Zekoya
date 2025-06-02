import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reportService from './reportService';

// Helper function to get error message
const getError = (error) => {
  return error.response && error.response.data.message
    ? error.response.data.message
    : error.message || 'An unexpected error occurred';
};

// Get sales report
export const getSalesReport = createAsyncThunk(
  'report/getSalesReport',
  async (filters, thunkAPI) => {
    try {
      const token = thunkAPI.getState().adminAuth.adminInfo.accessToken;
      return await reportService.getSalesReport(filters, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(getError(error));
    }
  }
);

// Get dashboard stats
export const getDashboardStats = createAsyncThunk(
  'report/getDashboardStats',
  async (timeFilter, thunkAPI) => {
    try {
      const token = thunkAPI.getState().adminAuth.adminInfo.accessToken;
      return await reportService.getDashboardStats(timeFilter, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(getError(error));
    }
  }
);

// Download report
export const downloadReport = createAsyncThunk(
  'report/downloadReport',
  async ({ filters, format }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().adminAuth.adminInfo.accessToken;
      return await reportService.downloadReport(filters, format, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(getError(error));
    }
  }
);

// Get best sellers
export const getBestSellers = createAsyncThunk(
  'report/getBestSellers',
  async (params, thunkAPI) => {
    try {
      const token = thunkAPI.getState().adminAuth.adminInfo.accessToken;
      return await reportService.getBestSellers(params, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(getError(error));
    }
  }
);

// Get payment statistics
export const getPaymentStats = createAsyncThunk(
  'report/getPaymentStats',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().adminAuth.adminInfo.accessToken;
      return await reportService.getPaymentStats(token);
    } catch (error) {
      return thunkAPI.rejectWithValue(getError(error));
    }
  }
);

const initialState = {
  salesReport: {
    data: null,
    loading: false,
    error: null
  },
  dashboardStats: {
    data: null,
    loading: false,
    error: null,
    lastFetched: null
  },
  bestSellers: {
    data: {
      products: [],
      categories: [],
      brands: []
    },
    loading: false,
    error: null,
    lastFetched: null
  },
  paymentStats: {
    data: [],
    loading: false,
    error: null,
    lastFetched: null
  },
  downloadStatus: {
    loading: false,
    success: false,
    error: null,
    url: null
  }
};

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.salesReport.error = null;
      state.dashboardStats.error = null;
      state.bestSellers.error = null;
      state.paymentStats.error = null;
      state.downloadStatus.error = null;
    },
    clearDownloadStatus: (state) => {
      state.downloadStatus = {
        loading: false,
        success: false,
        error: null,
        url: null
      };
    },
    reset: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      // Sales Report
      .addCase(getSalesReport.pending, (state) => {
        state.salesReport.loading = true;
        state.salesReport.error = null;
      })
      .addCase(getSalesReport.fulfilled, (state, action) => {
        state.salesReport.loading = false;
        state.salesReport.data = action.payload.data;
      })
      .addCase(getSalesReport.rejected, (state, action) => {
        state.salesReport.loading = false;
        state.salesReport.error = action.payload || 'Failed to load sales report';
      })
      // Dashboard Stats
      .addCase(getDashboardStats.pending, (state) => {
        state.dashboardStats.loading = true;
        state.dashboardStats.error = null;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.dashboardStats.loading = false;
        state.dashboardStats.data = action.payload;
        state.dashboardStats.lastFetched = Date.now();
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.dashboardStats.loading = false;
        state.dashboardStats.error = action.payload || 'Failed to load dashboard stats';
      })
      // Best Sellers
      .addCase(getBestSellers.pending, (state) => {
        state.bestSellers.loading = true;
        state.bestSellers.error = null;
      })
      .addCase(getBestSellers.fulfilled, (state, action) => {
        state.bestSellers.loading = false;
        
    
        const category = action.meta.arg.category || 'products';
        
    
        
        // Check if the response has the expected structure
        if (action.payload && action.payload.success && Array.isArray(action.payload.data)) {
          // Create a new copy of the data object to ensure React detects the change
          const newData = { ...state.bestSellers.data };
          
          // Update the appropriate category with the new data
          if (category === 'products') {
            newData.products = [...action.payload.data];
          } else if (category === 'categories') {
            newData.categories = [...action.payload.data];
          } else if (category === 'brands') {
            newData.brands = [...action.payload.data];
          }
          
          // Replace the entire data object to ensure React detects the change
          state.bestSellers.data = newData;
          
          
        } else {
          console.error(`Invalid response structure for ${category}:`, action.payload);
        }
        
        state.bestSellers.lastFetched = Date.now();
        
       
      })
      .addCase(getBestSellers.rejected, (state, action) => {
        state.bestSellers.loading = false;
        state.bestSellers.error = action.payload || 'Failed to load best sellers';
      })
      // Payment Stats
      .addCase(getPaymentStats.pending, (state) => {
        state.paymentStats.loading = true;
        state.paymentStats.error = null;
      })
      .addCase(getPaymentStats.fulfilled, (state, action) => {
        state.paymentStats.loading = false;
        // Handle both array and object responses
        if (Array.isArray(action.payload)) {
          state.paymentStats.data = action.payload;
        } else if (action.payload.data && Array.isArray(action.payload.data)) {
          state.paymentStats.data = action.payload.data;
        } else if (typeof action.payload === 'object') {
          // Convert object to array if needed
          state.paymentStats.data = Object.entries(action.payload).map(([key, value]) => ({
            _id: key,
            ...(typeof value === 'object' ? value : { count: value })
          }));
        } else {
          state.paymentStats.data = [];
        }
        state.paymentStats.lastFetched = Date.now();
      })
      .addCase(getPaymentStats.rejected, (state, action) => {
        state.paymentStats.loading = false;
        state.paymentStats.error = action.payload || 'Failed to load payment stats';
        state.paymentStats.data = [];
      })
      // Download Report
      .addCase(downloadReport.pending, (state) => {
        state.downloadStatus.loading = true;
        state.downloadStatus.error = null;
        state.downloadStatus.success = false;
      })
      .addCase(downloadReport.fulfilled, (state, action) => {
        state.downloadStatus.loading = false;
        state.downloadStatus.success = true;
        state.downloadStatus.url = action.payload?.fileUrl || null;
      })
      .addCase(downloadReport.rejected, (state, action) => {
        state.downloadStatus.loading = false;
        state.downloadStatus.error = action.payload || 'Failed to download report';
        state.downloadStatus.success = false;
      });
  },
});

export const { clearError, clearDownloadStatus, reset } = reportSlice.actions;
export default reportSlice.reducer;
