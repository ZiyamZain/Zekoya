import API from "../../utils/axiosConfig";

const ADMIN_API_URL = "/api/admin/orders";


const getAllOrders = async (params = {}) => {
  try {
    const response = await API.get(ADMIN_API_URL, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};


const getOrderDetails = async (id) => {
  try {
    const response = await API.get(`${ADMIN_API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateOrderStatus = async (data) => {
  const { orderId, status } = data;
  const response = await API.put(`${ADMIN_API_URL}/${orderId}/status`, { status });
  return response.data;
};

const processReturnRequest = async (data) => {
  const { orderId, itemId, action } = data;
  try {
    const response = await API.put(
      `${ADMIN_API_URL}/${orderId}/items/${itemId}/return`,
      { action }
    );
    return response.data;
  } catch (error) {
    console.error('Error processing return request:', error.response?.data || error.message);
    throw error;
  }
};


const generateInvoice = async (orderId) => {
  try {
    const response = await API.get(`${ADMIN_API_URL}/${orderId}/invoice`, { 
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    });
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${orderId}.pdf`);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 100);
    
    return { success: true };
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw error;
  }
};

const adminOrderService = {
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
  processReturnRequest,
  generateInvoice
};

export default adminOrderService;
