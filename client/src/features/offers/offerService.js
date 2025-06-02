import { userAxios } from '../../utils/userAxiosConfig';

// Base URL is already set in userAxios, so we just need the path

// Get active offer for a product
const getActiveOfferForProduct = async (productId) => {
  try {
    const response = await userAxios.get(`/offers/product/active/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get active offer for a category
const getActiveOfferForCategory = async (categoryId) => {
  try {
    const response = await userAxios.get(`/offers/category/active/${categoryId}`);
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
