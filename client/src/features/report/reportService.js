import adminAxios from '../../utils/adminAxiosConfig';

// Base URL is already set in adminAxios, so we just need the path

// Helper function to handle API errors
const handleApiError = (error, context) => {
  console.error(`Error in ${context}:`, error.response?.data || error.message);
  const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
  throw new Error(errorMessage);
};

// Get sales report with filters
const getSalesReport = async (filters) => {
  const config = {
    params: filters,
  };

  try {
    // adminAxios will automatically add auth header
    const response = await adminAxios.get('/reports/sales', config);
  
    return response.data;
  } catch (error) {
    return handleApiError(error, 'getSalesReport');
  }
};

// Get dashboard statistics
const getDashboardStats = async (timeFilter) => {
  try {
    // adminAxios will automatically add auth header
    const response = await adminAxios.get(
      `/reports/dashboard?timeFilter=${timeFilter}`
    );

    return response.data;
  } catch (error) {
    return handleApiError(error, 'getDashboardStats');
  }
};

// Download sales report
const downloadReport = async (filters, format) => {
  try {
    // Configure the request
    const config = {
      params: { 
        startDate: filters.startDate,
        endDate: filters.endDate,
        format: format
      },
      responseType: 'blob', // Always use blob for downloads
    };
    
    // Make the API request
    // adminAxios will automatically add auth header
    const response = await adminAxios.get('/reports/sales', config);

    
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
const getBestSellers = async (params) => {
  const { category = 'products', limit = 5 } = params;

  try {
    // adminAxios will automatically add auth header
    const response = await adminAxios.get(
      `/reports/bestsellers?category=${category}&limit=${limit}`
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
const getPaymentStats = async () => {
  try {
    // adminAxios will automatically add auth header
    const response = await adminAxios.get(
      `/reports/payment-stats`
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
