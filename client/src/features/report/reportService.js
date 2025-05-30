import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Helper function to handle API errors
const handleApiError = (error, context) => {
  console.error(`Error in ${context}:`, error.response?.data || error.message);
  const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
  throw new Error(errorMessage);
};

// Get sales report with filters
const getSalesReport = async (filters, token) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params: filters,
  };


  try {
    const response = await axios.get(`${API_URL}/api/admin/reports/sales`, config);
  
    return response.data;
  } catch (error) {
    return handleApiError(error, 'getSalesReport');
  }
};

// Get dashboard statistics
const getDashboardStats = async (timeFilter, token) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };


  try {
    const response = await axios.get(
      `${API_URL}/api/admin/reports/dashboard?timeFilter=${timeFilter}`, 
      config
    );

    return response.data;
  } catch (error) {
    return handleApiError(error, 'getDashboardStats');
  }
};

// Download sales report
const downloadReport = async (filters, format, token) => {
  try {
  
    
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { 
        startDate: filters.startDate,
        endDate: filters.endDate,
        format: format
      },
      responseType: 'blob', // Always use blob for downloads
    };


    
    // Make the API request
    const response = await axios.get(`${API_URL}/api/admin/reports/sales`, config);

    
    // Create a clean filename
    const startDate = filters.startDate ? new Date(filters.startDate).toISOString().split('T')[0] : 'all';
    const endDate = filters.endDate ? new Date(filters.endDate).toISOString().split('T')[0] : 'all';
    const extension = format === 'pdf' ? 'pdf' : 'xlsx';
    const filename = `sales-report_${startDate}_to_${endDate}.${extension}`;
    
    // Create a blob URL and trigger download
    const blob = new Blob([response.data], {
      type: format === 'pdf' 
        ? 'application/pdf' 
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      link.remove();
    }, 100);
    
    return { success: true, message: `${format.toUpperCase()} report downloaded successfully` };
  } catch (error) {
    console.error('Error downloading report:', error);
    throw error;
  }
};

// Get best sellers
const getBestSellers = async (params, token) => {
  const { category = 'products', limit = 5 } = params;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };


  try {
    const response = await axios.get(
      `${API_URL}/api/admin/reports/bestsellers?category=${category}&limit=${limit}`,
      config
    );

    
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
    
    } else {
      console.warn(`Unexpected response structure for ${category}:`, response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching best sellers for ${category}:`, error);
    return handleApiError(error, 'getBestSellers');
  }
};

// Get payment statistics
const getPaymentStats = async (token) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

 
  try {
    const response = await axios.get(
      `${API_URL}/api/admin/reports/payment-stats`,
      config
    );
    console.log('Payment stats response:', response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'getPaymentStats');
  }
};

const reportService = {
  getSalesReport,
  downloadReport,
  getDashboardStats,
  getBestSellers,
  getPaymentStats,
};

export default reportService;
