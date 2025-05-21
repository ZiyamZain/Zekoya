import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reportService from './reportService';

const initialState = {
  reports: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get sales report
export const getSalesReport = createAsyncThunk(
  'report/getSalesReport',
  async (reportParams, thunkAPI) => {
    try {
      const token = thunkAPI.getState().adminAuth.adminInfo.token;
      return await reportService.getSalesReport(reportParams, token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get dashboard statistics
export const getDashboardStats = createAsyncThunk(
  'report/getDashboardStats',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().adminAuth.adminInfo.token;
      return await reportService.getDashboardStats(token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    resetReport: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSalesReport.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSalesReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.reports = action.payload;
      })
      .addCase(getSalesReport.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getDashboardStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.reports = { ...state.reports, stats: action.payload };
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetReport } = reportSlice.actions;
export default reportSlice.reducer;
