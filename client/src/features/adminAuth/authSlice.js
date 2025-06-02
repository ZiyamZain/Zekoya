import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { login, logout, refreshAdminToken } from "./authService";

export const adminLogin = createAsyncThunk(
  "adminAuth/login",
  async (adminData, thunkAPI) => {
    try {
      const response = await login(adminData);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Login failed";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const adminLogout = createAsyncThunk("adminAuth/logout", async (_, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    const refreshToken = state.adminAuth.adminInfo?.refreshToken;
    await logout(refreshToken);
    return { success: true };
  } catch (error) {
    const message = error.response?.data?.message || error.message || "Logout failed";
    return thunkAPI.rejectWithValue(message);
  }
});

export const refreshAdminTokenThunk = createAsyncThunk(
  "adminAuth/refreshToken",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const refreshToken = state.adminAuth.adminInfo?.refreshToken;
      if (!refreshToken) throw new Error("No refresh token available");
      const response = await refreshAdminToken(refreshToken);
      // Merge new accessToken into adminInfo
      const updatedAdminInfo = {
        ...state.adminAuth.adminInfo,
        accessToken: response.accessToken,
      };
      localStorage.setItem("adminInfo", JSON.stringify(updatedAdminInfo));
      return updatedAdminInfo;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Token refresh failed";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const getInitialState = () => {
  const storedAdminInfo = localStorage.getItem("adminInfo");

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
    clearError: (state) => {
      state.error = null;
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
        if (action.payload && action.payload.accessToken && action.payload.refreshToken) {
          localStorage.setItem("adminInfo", JSON.stringify(action.payload));
        }
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(adminLogout.fulfilled, (state) => {
        state.adminInfo = null;
        localStorage.removeItem("adminInfo");
      })
      .addCase(refreshAdminTokenThunk.fulfilled, (state, action) => {
        state.adminInfo = action.payload;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
