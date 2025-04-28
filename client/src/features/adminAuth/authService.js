// src/features/adminAuth/authService.js
import axios from "axios";

const API_URL = "/api/admin";

// Admin Login
const login = async (adminData) => {
  const response = await axios.post(`${API_URL}/login`, adminData);
  if (response.data) {
    localStorage.setItem("adminInfo", JSON.stringify(response.data));
  }
  return response.data;
};

// Admin Logout
const logout = () => {
  localStorage.removeItem("adminInfo");
};

const authService = {
  login,
  logout,
};

export default authService;
