import API from "../../utils/axiosConfig";

const API_URL = "/api/cart";

const getCart = async () => {
  const response = await API.get(API_URL);
  return response.data;
};

const addToCart = async (cartData) => {
  const response = await API.post(API_URL, cartData);
  return response.data;
};

const updateCartItem = async (itemData) => {
  const response = await API.put(API_URL, itemData);
  return response.data;
};

const removeFromCart = async (itemId) => {
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
