import axios from 'axios';

const API_URL = 'http://localhost:5001/api/products';

// Get all products
const getAllProducts = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get product by ID
const getProductById = async (id) => {
  console.log('Fetching product with ID:', id);
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    console.log('Product response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    throw error;
  }
};

// Get products by category (paginated)
const getProductsByCategory = async (category, page = 1, limit = 10) => {
  console.log('Fetching products for category:', category, 'page:', page, 'limit:', limit);
  try {
    const response = await axios.get(`${API_URL}/category/${encodeURIComponent(category)}?page=${page}&limit=${limit}`);
    console.log('Products response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};


const productService = {
  getAllProducts,
  getProductById,
  getProductsByCategory,

};

export default productService; 