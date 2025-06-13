import { userAxios } from '../../utils/userAxiosConfig';

const register = async (userData) => {
  const response = await userAxios.post("/register", userData);
  if (response.data && response.data.otp) {
    console.log("DEV OTP:", response.data.otp);
  }
  return response.data;
};

const verifyOTP = async (otpData) => {
  const response = await userAxios.post("/verify-otp", otpData);
  if (response.data) {
    localStorage.setItem("userInfo", JSON.stringify(response.data));
  }
  return response.data;
};

const login = async (userData) => {
  const response = await userAxios.post("/login", userData);
  if (response.data) {
    localStorage.setItem("userInfo", JSON.stringify(response.data));
  }
  return response.data;
};

const googleLogin = async (userData) => {
  const response = await userAxios.post("/google-login", userData);
  if (response.data) {
    localStorage.setItem("userInfo", JSON.stringify(response.data));
  }
  return response.data;
};

const logout = async () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo && userInfo.refreshToken) {
      await userAxios.post(`/logout`, { refreshToken: userInfo.refreshToken });
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("userInfo");
  }
};

const refreshToken = async (refreshToken) => {
  const response = await userAxios.post("/refresh-token", { refreshToken });
  if (response.data) {
    localStorage.setItem("userInfo", JSON.stringify({
      ...JSON.parse(localStorage.getItem("userInfo")),
      ...response.data
    }));
  }
  return response.data;
};

const sendForgotPasswordOtp = async ({ email }) => {
  const response = await userAxios.post("/forgot-password/send-otp", { email });
  if (response.data && response.data.otp) {
    console.log("DEV FORGOT PASSWORD OTP:", response.data.otp);
  }
  return response.data;
};

const verifyForgotPasswordOtp = async ({ userId, otp }) => {
  const response = await userAxios.post("/forgot-password/verify-otp", {
    userId,
    otp,
  });
  return response.data;
};

const changePassword = async ({ userId, password }) => {
  const response = await userAxios.post(
    "/forgot-password/change-password",
    { userId, password }
  );
  return response.data;
};

const resendOTP = async (email) => {
  const response = await userAxios.post("/resend-otp", { email });
  return response.data;
};

const checkUserStatus = async () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  if (!userInfo?.token) return { isBlocked: false };
  
  try {
    const response = await userAxios.get(`/check-status`);
    return response.data;
  } catch (error) {
    console.error("Error checking user status:", error);
    return { isBlocked: error.response?.status === 403 };
  }
};

const userAuthService = {
  register,
  verifyOTP,
  login,
  googleLogin,
  logout,
  refreshToken,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  changePassword,
  resendOTP,
  checkUserStatus,
};

export default userAuthService;
