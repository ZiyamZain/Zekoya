import { offerAxios } from '../../utils/userAxiosConfig';

// Base URL is already set in userAxios, so we just need the path

// Get active offer for a product
const getActiveOfferForProduct = async (productId) => {
  const response = await offerAxios.get(`/product/active/${productId}`);
  return response.data;
};

// Get active offer for a category
const getActiveOfferForCategory = async (categoryId) => {
  const response = await offerAxios.get(`/category/active/${categoryId}`);
  return response.data;
};

const offerService = {
  getActiveOfferForProduct,
  getActiveOfferForCategory
};

export default offerService;
