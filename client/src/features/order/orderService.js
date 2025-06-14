import { orderAxios } from '../../utils/userAxiosConfig';


// Base URL is already set in userAxios, so we just need the path
// Create new order
const createOrder = async (orderData) => {
  try {
    // orderAxios will automatically add auth header
    const response = await orderAxios.post('/', orderData);
    return response.data;
  } catch (error) {
    console.error('Order creation error details:', error.response?.data);
    throw error;
  }
};

// Get order details
const getOrderDetails = async (id) => {
  // orderAxios will automatically add auth header
  const response = await orderAxios.get(`/${id}`);
  return response.data;
};

// Get my orders
const getMyOrders = async (params = {}) => {
  const { page = 1, limit = 10 } = params;
  // orderAxios will automatically add auth header
  const response = await orderAxios.get('/', { params: { page, limit } });
  return response.data;
};

// Cancel entire order
const cancelOrder = async (data) => {
  const { orderId, reason } = data;
  // orderAxios will automatically add auth header
  const response = await orderAxios.post(`/${orderId}/cancel`, { 
    reason: reason || "Cancelled by customer" 
  });
  return response.data;
};

// Cancel order item
const cancelOrderItem = async (data) => {
  const { orderId, itemId, reason } = data;
  // orderAxios will automatically add auth header
  const response = await orderAxios.post(`/${orderId}/items/${itemId}/cancel`, { reason });
  return response.data;
};

// Request return for item
const requestReturnItem = async (data) => {
  const { orderId, itemId, returnReason } = data;
  // orderAxios will automatically add auth header
  const response = await orderAxios.post(`/${orderId}/items/${itemId}/return`, { reason: returnReason });
  return response.data;
};

// Update order to paid status
const updateOrderToPaid = async (orderId) => {
  // orderAxios will automatically add auth header
  const response = await orderAxios.put(`/${orderId}/pay`);
  return response.data;
};

// Generate invoice
const generateInvoice = async (orderId) => {
  try {
    // Make API request with proper authentication using userAxios
    const response = await orderAxios.get(`/${orderId}/invoice`, { 
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
  generateInvoice,
  updateOrderToPaid
};

export default orderService;
