import API from "../../utils/axiosConfig";

const API_URL = "/api/cart";

// Get user cart
const getCart = async (token) => {
  const response = await API.get(API_URL);
  return response.data;
};

// Add item to cart
const addToCart = async (cartData, token) => {
  const response = await API.post(API_URL, cartData);
  return response.data;
};

// Update cart item
const updateCartItem = async (itemData, token) => {
  const response = await API.put(API_URL, itemData);
  return response.data;
};

// Remove item from cart
const removeFromCart = async (itemId, token) => {
  const response = await API.delete(`${API_URL}/${itemId}`);
  return response.data;
};

const cartService = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
};

export default cartService;
