import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userAuthService from "./userAuthService";

const initialState = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
  userId: null,
  otpSent: false,
  forgotOtpSent: false,
  forgotUserId: null,
  loading: false,
  error: null,
};

export const userRegister = createAsyncThunk(
  "userAuth/register",
  async (userData, thunkAPI) => {
    try {
      return await userAuthService.register(userData);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Registration failed";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const verifyOTP = createAsyncThunk(
  "userAuth/verifyOTP",
  async (otpData, thunkAPI) => {
    try {
      return await userAuthService.verifyOTP(otpData);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "OTP verification failed";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const resetOTP = createAsyncThunk("userAuth/resetOTP", async () => {
  return { otpSent: false, userId: null };
});

export const resendOTP = createAsyncThunk(
  "userAuth/resendOTP",
  async (email, thunkAPI) => {
    try {
      return await userAuthService.resendOTP(email);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to resend OTP";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const userLogin = createAsyncThunk(
  "userAuth/login",
  async (userData, thunkAPI) => {
    try {
      return await userAuthService.login(userData);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Login failed";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const googleLogin = createAsyncThunk(
  "userAuth/googleLogin",
  async (userData, thunkAPI) => {
    try {
      return await userAuthService.googleLogin(userData);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Google login failed";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const userLogout = createAsyncThunk("userAuth/logout", async (_, thunkAPI) => {
  try {
    await userAuthService.logout();
    return { success: true };
  } catch (error) {
    const message = error.response?.data?.message || error.message || "Logout failed";
    return thunkAPI.rejectWithValue(message);
  }
});

export const refreshUserToken = createAsyncThunk(
  "userAuth/refreshToken",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const userInfo = state.userAuth.userInfo;
      
      if (!userInfo) {
        throw new Error('No user info available');
      }
      
      const refreshToken = userInfo.refreshToken || userInfo.refresh_token;
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      // Call the refresh token endpoint
      const data = await userAuthService.refreshToken(refreshToken);
      
      if (!data || !data.accessToken) {
        throw new Error('Invalid response from refresh token endpoint');
      }
      
      // Update the user info with new tokens
      const updatedUserInfo = {
        ...userInfo,
        token: data.accessToken, // For backward compatibility
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || refreshToken, // Use new refresh token if provided, otherwise keep the old one
      };
      
      // Save to localStorage
      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
      
      return updatedUserInfo;
    } catch (error) {
      console.error('Refresh token error:', error);
      // If refresh fails, clear the user info and force re-login
      localStorage.removeItem("userInfo");
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Session expired. Please log in again.'
      );
    }
  }
);

export const sendForgotPasswordOtp = createAsyncThunk(
  "userAuth/sendForgotPasswordOtp",
  async ({ email }, thunkAPI) => {
    try {
      return await userAuthService.sendForgotPasswordOtp({ email });
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to send OTP";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const verifyForgotPasswordOtp = createAsyncThunk(
  "userAuth/verifyForgotPasswordOtp",
  async ({ userId, otp }, thunkAPI) => {
    try {
      return await userAuthService.verifyForgotPasswordOtp({ userId, otp });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "OTP verification failed";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const resetForgotPasswordOtp = createAsyncThunk(
  "userAuth/resetForgotPasswordOtp",
  async () => ({ forgotOtpSent: false, forgotUserId: null })
);

export const changePassword = createAsyncThunk(
  "userAuth/changePassword",
  async ({ userId, password }, thunkAPI) => {
    try {
      return await userAuthService.changePassword({ userId, password });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to change password";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const userAuthSlice = createSlice({
  name: "userAuth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(userRegister.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userRegister.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSent = action.payload.otpSent;
        state.userId = action.payload.userId;
      })
      .addCase(userRegister.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        if (action.payload && action.payload.accessToken) {
          localStorage.setItem("userInfo", JSON.stringify(action.payload));
        }
        state.otpSent = false;
        state.userId = null;
        state.error = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(resetOTP.fulfilled, (state) => {
        state.otpSent = false;
        state.userId = null;
        state.error = null;
        state.loading = false;
      })

      .addCase(resendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOTP.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(userLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(userLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(userLogout.fulfilled, (state) => {
        state.userInfo = null;
        state.otpSent = false;
        state.userId = null;
      })

      .addCase(sendForgotPasswordOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendForgotPasswordOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.forgotOtpSent = true;
        state.forgotUserId = action.payload.userId;
      })
      .addCase(sendForgotPasswordOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyForgotPasswordOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyForgotPasswordOtp.fulfilled, (state) => {
        state.loading = false;
        state.forgotOtpSent = false;
      })
      .addCase(verifyForgotPasswordOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resetForgotPasswordOtp.fulfilled, (state) => {
        state.forgotOtpSent = false;
        state.forgotUserId = null;
        state.error = null;
        state.loading = false;
      })
      
  },
});

export default userAuthSlice.reducer;
