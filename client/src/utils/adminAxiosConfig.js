import axios from "axios";
import { refreshAdminTokenThunk, adminLogout } from "../features/adminAuth/authSlice";

const adminAxios = axios.create({
  baseURL: "/api/admin",
});

adminAxios.interceptors.request.use(
  async (config) => {
    // Allow certain requests (e.g. refresh-token) to explicitly skip attaching auth headers
    if (config._skipAuth) {
      delete config._skipAuth; // clean up flag so it doesn’t leak to backend
      return config;
    }

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

adminAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the failed request was itself a refresh attempt, do not retry again — just logout
    if (originalRequest?.url?.includes("/refresh-token")) {
      const storeModule = await import("../app/store");
      const store = storeModule.default;
      store.dispatch(adminLogout());
      return Promise.reject(error);
    }

    //lazy import to avoid circualr dependency
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
      } catch { 
        store.dispatch(adminLogout());
      }
    }
    return Promise.reject(error);
  }
);

export default adminAxios;
