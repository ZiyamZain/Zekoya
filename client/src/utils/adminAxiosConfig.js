import axios from "axios";
import { refreshAdminTokenThunk, adminLogout } from "../features/adminAuth/authSlice";

const adminAxios = axios.create({
  baseURL: "/api/admin",
});

// Request interceptor to add access token
adminAxios.interceptors.request.use(
  async (config) => {
    // Lazy import store to avoid circular dependency using ES6 dynamic import
    const storeModule = await import("../app/store");
    const store = storeModule.default;
    const adminInfo = store.getState().adminAuth.adminInfo;
    if (adminInfo && adminInfo.accessToken) {
      config.headers["Authorization"] = `Bearer ${adminInfo.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
adminAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Lazy import store to avoid circular dependency using ES6 dynamic import
    const storeModule = await import("../app/store");
    const store = storeModule.default;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      store.getState().adminAuth.adminInfo?.refreshToken
    ) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh token
        const result = await store.dispatch(refreshAdminTokenThunk());
        const newAccessToken = result.payload?.accessToken;
        if (newAccessToken) {
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return adminAxios(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, force logout
        store.dispatch(adminLogout());
      }
    }
    return Promise.reject(error);
  }
);

export default adminAxios;
