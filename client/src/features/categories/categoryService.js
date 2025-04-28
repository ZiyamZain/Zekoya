import axios from 'axios';

const API_URL = 'http://localhost:5001/api/categories';

// Get all categories
const getAllCategories = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

const categoryService = {
  getAllCategories,
};

export default categoryService; 