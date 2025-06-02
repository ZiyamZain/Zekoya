import axios from "axios";

const API_URL = "http://localhost:5001/api/admin";

export const login = async (adminData) => {
  const response = await axios.post(`${API_URL}/login`, adminData);
  // Store both tokens and admin info
  if (response.data.accessToken && response.data.refreshToken) {
    localStorage.setItem("adminInfo", JSON.stringify(response.data));
  }
  return response.data;
};

export const logout = async (refreshToken) => {
  await axios.post(`${API_URL}/logout`, { refreshToken });
  localStorage.removeItem("adminInfo");
};
export const refreshAdminToken = async (refreshToken) => {
  const response = await axios.post(`${API_URL}/refresh-token`, { refreshToken });
  return response.data;
};
