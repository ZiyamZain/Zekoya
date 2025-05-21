import axios from 'axios';

//axioss instance
const API = axios.create({
  baseURL: 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json'
  }
});


API.interceptors.request.use(
  (config) => {
    const isAdminRoute = config.url.includes('/api/admin') || config.url.includes('/admin');

    if (isAdminRoute) {

      const adminInfoStr = localStorage.getItem('adminInfo');
      
      if (adminInfoStr) {
        const adminInfo = JSON.parse(adminInfoStr);
        
        if (adminInfo && adminInfo.token) {
          config.headers.Authorization = `Bearer ${adminInfo.token}`;

        } else {
          console.log('Admin token not found in adminInfo');
        }
      } else {
        console.log('No adminInfo found in localStorage');
      }
    } else {
      // For user routes, use user token
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo && userInfo.token) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
