import axios from 'axios';

 
const createUserAxiosInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
  });

  configureRequestInterceptor(instance);//req
  configureResponseInterceptor(instance);//res
  
  return instance;
};

const userAxios = createUserAxiosInstance('/api/users');
const productAxios = createUserAxiosInstance('/api/products');
const cartAxios = createUserAxiosInstance('/api/cart');
const wishlistAxios = createUserAxiosInstance('/api/wishlist');
const orderAxios = createUserAxiosInstance('/api/orders');
const couponAxios = createUserAxiosInstance('/api/coupons');
const paymentAxios = createUserAxiosInstance('/api/payments');
const offerAxios = createUserAxiosInstance('/api/offers');
const categoryAxios = createUserAxiosInstance('/api/categories');


// req config
function configureRequestInterceptor(instance) {
  instance.interceptors.request.use(
    async (config) => {
      if (config._skipAuth) {
        delete config._skipAuth;
        return config;
      }
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.accessToken || userInfo?.token;
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
}

function configureResponseInterceptor(instance) {
  
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Skip if no config or already retried
      if (!originalRequest || originalRequest._retry) {
        return Promise.reject(error);
      }
      //if (401=unauthorized) occurs
      if (error.response?.status !== 401) {
        return Promise.reject(error);
      }

      originalRequest._retry = true; // flag for avoiding infinite loops

      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo) {
          console.log("No user info found, redirecting to login");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        const refreshToken = userInfo.refreshToken || userInfo.refresh_token;
        if (!refreshToken) {
          console.log("No refresh token found, logging out");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Call refresh token endpoint
        const response = await axios({
          method: "post",
          url: "/api/users/refresh-token",
          data: { refreshToken },
          _skipAuth: true,
        });

        if (response.data.accessToken) {
          const updatedUserInfo = {
            ...userInfo,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken || refreshToken,
          };

          localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return axios(originalRequest);//now retry the request
        }

        throw new Error("No access token in response");
        
      }catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("userInfo");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }
  );
}
export { userAxios, productAxios, cartAxios, wishlistAxios, orderAxios, couponAxios, paymentAxios, offerAxios, categoryAxios };
