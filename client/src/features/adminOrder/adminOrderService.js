import API from "../../utils/axiosConfig";

const ADMIN_API_URL = "/api/admin/orders";

// Get all orders with filtering and pagination
const getAllOrders = async (params = {}) => {
  console.log('Calling getAllOrders with params:', params);
  try {
    const response = await API.get(ADMIN_API_URL, { params });
    console.log('getAllOrders response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getAllOrders:', error.response || error);
    throw error;
  }
};

// Get order details
const getOrderDetails = async (id) => {
  console.log('Calling getOrderDetails with id:', id);
  try {
    const response = await API.get(`${ADMIN_API_URL}/${id}`);
    console.log('getOrderDetails response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getOrderDetails:', error.response || error);
    throw error;
  }
};

// Update order status
const updateOrderStatus = async (data) => {
  const { orderId, status } = data;
  const response = await API.put(`${ADMIN_API_URL}/${orderId}/status`, { status });
  return response.data;
};

// Process return request
const processReturnRequest = async (data) => {
  const { orderId, itemId, action } = data;
  console.log('Processing return request:', { orderId, itemId, action });
  try {
    const response = await API.put(
      `${ADMIN_API_URL}/${orderId}/items/${itemId}/return`,
      { action }
    );
    console.log('Return request processed successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error processing return request:', error.response?.data || error.message);
    throw error;
  }
};

// Generate invoice PDF
const generateInvoice = async (orderId) => {
  try {
    console.log(`Generating invoice for order: ${orderId}`);
    const response = await API.get(`${ADMIN_API_URL}/${orderId}/invoice`, { 
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

const adminOrderService = {
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
  processReturnRequest,
  generateInvoice
};

export default adminOrderService;
