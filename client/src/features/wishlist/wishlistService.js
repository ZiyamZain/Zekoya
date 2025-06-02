import { userAxios } from '../../utils/userAxiosConfig';

// Base URL is already set in userAxios, so we just need the path

// Get user wishlist
const getWishlist = async () => {
  // userAxios will automatically add auth header
  const response = await userAxios.get('/wishlist');
  return response.data;
};

// Add product to wishlist
const addToWishlist = async (productId) => {
  // userAxios will automatically add auth header
  const response = await userAxios.post('/wishlist', { productId });
  return response.data;
};

// Remove product from wishlist
const removeFromWishlist = async (productId) => {
  // userAxios will automatically add auth header
  const response = await userAxios.delete(`/wishlist/${productId}`);
  return response.data;
};

const wishlistService = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};

export default wishlistService;
