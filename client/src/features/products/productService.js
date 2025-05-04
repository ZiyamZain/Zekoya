import axios from 'axios';

const API_URL = 'http://localhost:5001/api/products';

const getAllProducts = async (page = 1, limit = 6) => {
  const response = await axios.get(`${API_URL}?page=${page}&limit=${limit}`);
  return response.data;
};

const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);

    return response.data;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    throw error;
  }
};


const getProductsByCategory = async (category, page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/category/${encodeURIComponent(category)}?page=${page}&limit=${limit}`);
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