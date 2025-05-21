import API from "../../utils/axiosConfig";

const API_URL = "/api/orders";
// Create new order
const createOrder = async (orderData) => {
  try {
    const response = await API.post(API_URL, orderData);
    return response.data;
  } catch (error) {
    console.error('Order creation error details:', error.response?.data);
    throw error;
  }
};

// Get order details
const getOrderDetails = async (id) => {
  const response = await API.get(`${API_URL}/${id}`);
  return response.data;
};

// Get my orders
const getMyOrders = async (params = {}) => {
  const { page = 1, limit = 10 } = params;
  const response = await API.get(API_URL, { params: { page, limit } });
  return response.data;
};

// Cancel entire order
const cancelOrder = async (data) => {
  const { orderId, reason } = data;
  const response = await API.post(`${API_URL}/${orderId}/cancel`, { reason });
  return response.data;
};

// Cancel order item
const cancelOrderItem = async (data) => {
  const { orderId, itemId, reason } = data;
  const response = await API.post(`${API_URL}/${orderId}/items/${itemId}/cancel`, { reason });
  return response.data;
};

// Request return for item
const requestReturnItem = async (data) => {
  const { orderId, itemId, reason } = data;
  const response = await API.post(`${API_URL}/${orderId}/items/${itemId}/return`, { reason });
  return response.data;
};

// Generate invoice
const generateInvoice = async (orderId) => {
  try {
    // Make API request with proper authentication
    const response = await API.get(`${API_URL}/${orderId}/invoice`, { 
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    });
    
    // Create a blob URL and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    
    // Create a link element for the download
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

const orderService = {
  createOrder,
  getOrderDetails,
  getMyOrders,
  cancelOrder,
  cancelOrderItem,
  requestReturnItem,
  generateInvoice
};

export default orderService;
