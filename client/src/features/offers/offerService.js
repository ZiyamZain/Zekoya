import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/offers`;

// Get active offer for a product
const getActiveOfferForProduct = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/product/active/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get active offer for a category
const getActiveOfferForCategory = async (categoryId) => {
  try {
    const response = await axios.get(`${API_URL}/category/active/${categoryId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const offerService = {
  getActiveOfferForProduct,
  getActiveOfferForCategory
};

export default offerService;
