import { productAxios } from '../../utils/userAxiosConfig';

// Base URL is already set in productAxios, so we just need the path

const getAllProducts = async (page = 1, limit = 6) => {
  const response = await productAxios.get(`/?page=${page}&limit=${limit}`);
  return response.data;
};

const getProductById = async (id) => {
  try {
    const response = await productAxios.get(`/${id}`);

    return response.data;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    throw error;
  }
};


const getProductsByCategory = async (category, page = 1, limit = 10) => {
  try {
    const response = await productAxios.get(`/category/${encodeURIComponent(category)}?page=${page}&limit=${limit}`);
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