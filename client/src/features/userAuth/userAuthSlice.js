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
export const googleSignIn = createAsyncThunk(
  "userAuth/googleSignIn",
  async (userData, thunkAPI) => {
    try {
      return await userAuthService.googleSignIn(userData);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Google sign-in failed";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const userLogout = createAsyncThunk("userAuth/logout", async () => {
  userAuthService.logout();
});

// Forgot password OTP flow
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
        error.response?.data?.message || error.message || "OTP verification failed";
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
        error.response?.data?.message || error.message || "Failed to change password";
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
      // Register
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
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.otpSent = false;
        state.userId = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reset OTP
      .addCase(resetOTP.fulfilled, (state) => {
        state.otpSent = false;
        state.userId = null;
        state.error = null;
        state.loading = false;
      })
      // Login
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
      // Google Login
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
      // Google Sign In
      .addCase(googleSignIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleSignIn.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(googleSignIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(userLogout.fulfilled, (state) => {
        state.userInfo = null;
        state.otpSent = false;
        state.userId = null;
      })
      // Forgot password OTP flow
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
      .addCase(verifyForgotPasswordOtp.fulfilled, (state, action) => {
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
      });
  },
});

export default userAuthSlice.reducer;
