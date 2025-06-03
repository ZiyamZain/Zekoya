import { wishlistAxios } from '../../utils/userAxiosConfig';

// Base URL is already set in wishlistAxios, so we just need the path

// Get user wishlist
const getWishlist = async () => {
  // wishlistAxios will automatically add auth header
  const response = await wishlistAxios.get('');
  return response.data;
};

// Add product to wishlist
const addToWishlist = async (productId) => {
  // wishlistAxios will automatically add auth header
  const response = await wishlistAxios.post('', { productId });
  return response.data;
};

// Remove product from wishlist
const removeFromWishlist = async (productId) => {
  // wishlistAxios will automatically add auth header
  const response = await wishlistAxios.delete(`/${productId}`);
  return response.data;
};

const wishlistService = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};

export default wishlistService;
