import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";


export const adminLogin = createAsyncThunk(
  "adminAuth/login",
  async (adminData, thunkAPI) => {
    try {
      const response = await authService.login(adminData);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Login failed";
      return thunkAPI.rejectWithValue(message);
    }
  }
);


export const adminLogout = createAsyncThunk("adminAuth/logout", async () => {
  authService.logout();
});


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
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(adminLogout.fulfilled, (state) => {
        state.adminInfo = null;
      });
  },
});

export const { refreshToken } = authSlice.actions;
export default authSlice.reducer;
