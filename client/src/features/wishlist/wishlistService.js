import API from "../../utils/axiosConfig";

const API_URL = "/api/wishlist";

// Get user wishlist
const getWishlist = async (token) => {
  const response = await API.get(API_URL);
  return response.data;
};

// Add product to wishlist
const addToWishlist = async (productId, token) => {
  const response = await API.post(API_URL, { productId });
  return response.data;
};

// Remove product from wishlist
const removeFromWishlist = async (productId, token) => {
  const response = await API.delete(`${API_URL}/${productId}`);
  return response.data;
};

const wishlistService = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};

export default wishlistService;
