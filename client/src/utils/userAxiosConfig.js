import axios from 'axios';
import { refreshUserToken, userLogout } from '../features/userAuth/userAuthSlice';

// Create a factory function to generate axios instances with different base URLs
const createUserAxiosInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
  });

  // Add request interceptor
  configureRequestInterceptor(instance);
  
  // Add response interceptor
  configureResponseInterceptor(instance);
  
  return instance;
};

// Main user-related axios instances
const userAxios = createUserAxiosInstance('/api/users');
const productAxios = createUserAxiosInstance('/api/products');
const cartAxios = createUserAxiosInstance('/api/cart');
const wishlistAxios = createUserAxiosInstance('/api/wishlist');
const orderAxios = createUserAxiosInstance('/api/orders');
const couponAxios = createUserAxiosInstance('/api/coupons');
const paymentAxios = createUserAxiosInstance('/api/payments');


// Configure request interceptor for all instances
function configureRequestInterceptor(instance) {
  instance.interceptors.request.use(
    async (config) => {
      // Lazy import store to avoid circular dependency using ES6 dynamic import
      const storeModule = await import('../app/store');
      const store = storeModule.default;
      const userInfo = store.getState().userAuth.userInfo;
      // Check for token in either accessToken or token field
      const token = userInfo?.accessToken || userInfo?.token;
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
}

// Configure response interceptor for all instances
function configureResponseInterceptor(instance) {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      // Lazy import store to avoid circular dependency using ES6 dynamic import
      const storeModule = await import('../app/store');
      const store = storeModule.default;
      if (
        error.response &&
        error.response.status === 401 &&
        !originalRequest._retry &&
        (store.getState().userAuth.userInfo?.refreshToken)
      ) {
        originalRequest._retry = true;
        try {
          // Attempt to refresh token
          const result = await store.dispatch(refreshUserToken());
          // Check for token in either accessToken or token field
          const newAccessToken = result.payload?.accessToken || result.payload?.token;
          if (newAccessToken) {
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            // Use the same instance that made the original request
            return axios(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, force logout
          store.dispatch(userLogout());
        }
      }
      return Promise.reject(error);
    }
  );
}

// Export all instances
export { userAxios, productAxios, cartAxios, wishlistAxios, orderAxios, couponAxios, paymentAxios };
