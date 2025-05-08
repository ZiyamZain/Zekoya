import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
API.interceptors.request.use(
  (config) => {
    // Check if the request is for an admin route
    const isAdminRoute = config.url.includes('/api/admin') || config.url.includes('/admin');
    console.log('Request URL:', config.url);
    console.log('Is admin route:', isAdminRoute);
    
    if (isAdminRoute) {
      // For admin routes, use admin token
      const adminInfoStr = localStorage.getItem('adminInfo');
      console.log('Admin info from localStorage:', adminInfoStr);
      
      if (adminInfoStr) {
        const adminInfo = JSON.parse(adminInfoStr);
        console.log('Parsed admin info:', adminInfo);
        
        if (adminInfo && adminInfo.token) {
          console.log('Using admin token for request:', adminInfo.token);
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
    
    console.log('Final request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
