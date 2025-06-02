import adminAxios from '../../../utils/adminAxiosConfig';

// Base URL is already set in adminAxios, so we just need the path

// Get all product offers
const getAllProductOffers = async (params = {}) => {
  // adminAxios will automatically add auth header
  const response = await adminAxios.get('/offers/product', { params });
  return response.data;
};

// Get product offer by ID
const getProductOfferById = async (id) => {
  // adminAxios will automatically add auth header
  const response = await adminAxios.get(`/offers/product/${id}`);
  return response.data;
};

// Create a new product offer
const createProductOffer = async (offerData) => {
  // adminAxios will automatically add auth header
  const response = await adminAxios.post('/offers/product', offerData);
  return response.data;
};

// Update a product offer
const updateProductOffer = async (id, offerData) => {
  // adminAxios will automatically add auth header
  const response = await adminAxios.put(`/offers/product/${id}`, offerData);
  return response.data;
};

// Delete a product offer
const deleteProductOffer = async (id) => {
  // adminAxios will automatically add auth header
  const response = await adminAxios.delete(`/offers/product/${id}`);
  return response.data;
};

const productOfferService = {
  getAllProductOffers,
  getProductOfferById,
  createProductOffer,
  updateProductOffer,
  deleteProductOffer
};

export default productOfferService;
