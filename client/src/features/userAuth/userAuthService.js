import axios from "axios";

const API_URL = "http://localhost:5001/api/users";

const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);

  if (response.data && response.data.otp) {
    console.log("DEV OTP:", response.data.otp);
  }
  return response.data;
};

const verifyOTP = async (otpData) => {
  const response = await axios.post(`${API_URL}/verify-otp`, otpData);
  if (response.data) {
    localStorage.setItem("userInfo", JSON.stringify(response.data));
  }
  return response.data;
};

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

const logout = () => {
  localStorage.removeItem("userInfo");
};

const sendForgotPasswordOtp = async ({ email }) => {
  const response = await axios.post(`${API_URL}/forgot-password/send-otp`, {
    email,
  });
  if (response.data && response.data.otp) {
    console.log("DEV FORGOT PASSWORD OTP:", response.data.otp);
  }
  return response.data;
};

const verifyForgotPasswordOtp = async ({ userId, otp }) => {
  const response = await axios.post(`${API_URL}/forgot-password/verify-otp`, {
    userId,
    otp,
  });
  return response.data;
};

const changePassword = async ({ userId, password }) => {
  const response = await axios.post(
    `${API_URL}/forgot-password/change-password`,
    { userId, password }
  );
  return response.data;
};

// Resend OTP
const resendOTP = async (email) => {
  const response = await axios.post(`${API_URL}/resend-otp`, { email });
  return response.data;
};

const checkUserStatus = async () => {
  // Get the token from localStorage
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  
  if (!userInfo || !userInfo.token) {
    return { isBlocked: false }; // No user logged in
  }
  
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/profile/check-status`, 
      config
    );
    
    return response.data;
  } catch (error) {
    console.error("Error checking user status:", error);
    // If we get a 403 error, the user is likely blocked
    if (error.response && error.response.status === 403) {
      return { isBlocked: true };
    }
    return { isBlocked: false };
  }
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
  resendOTP,
  checkUserStatus
};

export default userAuthService;
