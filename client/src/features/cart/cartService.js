import { cartAxios } from '../../utils/userAxiosConfig';

// Base URL is already set in cartAxios, so we just need the path

const getCart = async () => {
  // cartAxios will automatically add auth header
  const response = await cartAxios.get('/');
  return response.data;
};

const addToCart = async (cartData) => {
  // cartAxios will automatically add auth header
  const response = await cartAxios.post('/', cartData);
  return response.data;
};

const updateCartItem = async (itemData) => {
  // cartAxios will automatically add auth header
  const response = await cartAxios.put('/', itemData);
  return response.data;
};

const removeFromCart = async (itemId) => {
  // cartAxios will automatically add auth header
  const response = await cartAxios.delete(`/${itemId}`);
  return response.data;
};

const cartService = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
};

export default cartService;
