// src/features/adminAuth/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";

// Async thunk for admin login
export const adminLogin = createAsyncThunk(
  "adminAuth/login",
  async (adminData, thunkAPI) => {
    try {
      const response = await authService.login(adminData);
      console.log('Login response:', response); // Debug log
      return response;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        "Login failed";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Logout thunk
export const adminLogout = createAsyncThunk("adminAuth/logout", async () => {
  authService.logout();
});

// Initialize state from localStorage
const getInitialState = () => {
  const storedAdminInfo = localStorage.getItem("adminInfo");
  console.log('Initializing state with stored admin info:', storedAdminInfo); // Debug log
  return {
    adminInfo: storedAdminInfo ? JSON.parse(storedAdminInfo) : null,
    loading: false,
    error: null,
  };
};

const authSlice = createSlice({
  name: "adminAuth",
  initialState: getInitialState(),
  reducers: {
    // Add a reducer to refresh the token from localStorage
    refreshToken: (state) => {
      const storedAdminInfo = localStorage.getItem("adminInfo");
      if (storedAdminInfo) {
        state.adminInfo = JSON.parse(storedAdminInfo);
      } else {
        state.adminInfo = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.adminInfo = action.payload;
        state.error = null;
        console.log('Login fulfilled, new state:', state); // Debug log
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.log('Login rejected:', action.payload); // Debug log
      })
      .addCase(adminLogout.fulfilled, (state) => {
        state.adminInfo = null;
        console.log('Logout fulfilled, state cleared'); // Debug log
      });
  },
});

export const { refreshToken } = authSlice.actions;
export default authSlice.reducer;
