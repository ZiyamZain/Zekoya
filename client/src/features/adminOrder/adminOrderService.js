import adminAxios from '../../utils/adminAxiosConfig';

// Base URL is already set in adminAxios, so we just need the path


const getAllOrders = async (params = {}) => {
  // adminAxios will automatically add auth header
  const response = await adminAxios.get('/orders', { params });
  return response.data;
};


const getOrderDetails = async (id) => {
  // adminAxios will automatically add auth header
  const response = await adminAxios.get(`/orders/${id}`);
  return response.data;
};

const updateOrderStatus = async (data) => {
  const { orderId, status } = data;
  // adminAxios will automatically add auth header
  const response = await adminAxios.put(`/orders/${orderId}/status`, { status });
  return response.data;
};

const processReturnRequest = async (data) => {
  const { orderId, itemId, action } = data;
  try {
    // adminAxios will automatically add auth header
    const response = await adminAxios.put(
      `/orders/${orderId}/items/${itemId}/return`,
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
    // adminAxios will automatically add auth header
    const response = await adminAxios.get(`/orders/${orderId}/invoice`, { 
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
