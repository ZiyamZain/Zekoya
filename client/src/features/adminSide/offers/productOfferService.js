import API from '../../../utils/axiosConfig';

const API_URL = '/api/admin/offers/product';

// Get all product offers
const getAllProductOffers = async (params = {}) => {
  const response = await API.get(API_URL, { params });
  return response.data;
};

// Get product offer by ID
const getProductOfferById = async (id) => {
  const response = await API.get(`${API_URL}/${id}`);
  return response.data;
};

// Create a new product offer
const createProductOffer = async (offerData) => {
  const response = await API.post(API_URL, offerData);
  return response.data;
};

// Update a product offer
const updateProductOffer = async (id, offerData) => {
  const response = await API.put(`${API_URL}/${id}`, offerData);
  return response.data;
};

// Delete a product offer
const deleteProductOffer = async (id) => {
  const response = await API.delete(`${API_URL}/${id}`);
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
