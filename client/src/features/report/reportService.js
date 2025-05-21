import API from '../../utils/axiosConfig';

// Get sales report
const getSalesReport = async (reportParams, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Convert params to query string
  const queryParams = new URLSearchParams();
  if (reportParams?.startDate) queryParams.append('startDate', reportParams.startDate);
  if (reportParams?.endDate) queryParams.append('endDate', reportParams.endDate);
  if (reportParams?.format) queryParams.append('format', reportParams.format);
  
  const response = await API.get(`/api/admin/reports/sales?${queryParams.toString()}`, config);
  return response.data;
};

// Get dashboard statistics
const getDashboardStats = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await API.get('/api/admin/reports/dashboard', config);
  return response.data;
};

const reportService = {
  getSalesReport,
  getDashboardStats,
};

export default reportService;
