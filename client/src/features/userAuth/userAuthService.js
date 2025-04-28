import axios from "axios";

const API_URL = "http://localhost:5001/api/users";

// Register
const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  // DEV: Print OTP to console if present (for testing)
  if (response.data && response.data.otp) {
    // eslint-disable-next-line no-console
    console.log('DEV OTP:', response.data.otp);
  }
  return response.data;
};

// Verify OTP
const verifyOTP = async (otpData) => {
  const response = await axios.post(`${API_URL}/verify-otp`, otpData);
  if (response.data) {
    localStorage.setItem("userInfo", JSON.stringify(response.data));
  }
  return response.data;
};

// Login
const login = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData);
  if (response.data) {
    localStorage.setItem("userInfo", JSON.stringify(response.data));
  }
  return response.data;
};

// Google Login
const googleLogin = async (userData) => {
  const response = await axios.post(`${API_URL}/google-login`, userData);
  if (response.data) {
    localStorage.setItem("userInfo", JSON.stringify(response.data));
  }
  return response.data;
};

// Logout
const logout = () => {
  localStorage.removeItem("userInfo");
};

// Forgot Password: Send OTP
const sendForgotPasswordOtp = async ({ email }) => {
  const response = await axios.post(`${API_URL}/forgot-password/send-otp`, { email });
  if (response.data && response.data.otp) {
    // eslint-disable-next-line no-console
    console.log('DEV FORGOT PASSWORD OTP:', response.data.otp);
  }
  return response.data;
};

// Forgot Password: Verify OTP
const verifyForgotPasswordOtp = async ({ userId, otp }) => {
  const response = await axios.post(`${API_URL}/forgot-password/verify-otp`, { userId, otp });
  return response.data;
};

// Forgot Password: Change Password
const changePassword = async ({ userId, password }) => {
  const response = await axios.post(`${API_URL}/forgot-password/change-password`, { userId, password });
  return response.data;
};

const userAuthService = {
  register,
  verifyOTP,
  login,
  googleLogin,
  logout,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  changePassword,
};

export default userAuthService;
