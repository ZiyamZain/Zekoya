import axios from 'axios';

// VITE_API_URL is expected to be like 'https://www.zekoya.shop/api' or for local dev 'http://localhost:5001/api'
const EFFECTIVE_API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'; // Fallback now includes /api

const CATEGORIES_API_URL = `${EFFECTIVE_API_BASE}/categories`; // Simply append the resource name

const getAllCategories = async () => {
  // console.log('Fetching categories from:', CATEGORIES_API_URL); // Optional: for debugging
  const response = await axios.get(CATEGORIES_API_URL);
  return response.data;
};

const getCategoryById = async (id) => {
  // console.log(`Fetching category ${id} from: ${CATEGORIES_API_URL}/${id}`); // Optional: for debugging
  const response = await axios.get(`${CATEGORIES_API_URL}/${id}`);
  return response.data;
};

const categoryService = {
  getAllCategories,
  getCategoryById,
};

export default categoryService; 