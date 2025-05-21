import API from '../../../utils/axiosConfig';

const API_URL = '/api/admin/offers/category';

// Get all category offers
const getAllCategoryOffers = async (params = {}) => {
  const response = await API.get(API_URL, { params });
  return response.data;
};

// Get category offer by ID
const getCategoryOfferById = async (id) => {
  const response = await API.get(`${API_URL}/${id}`);
  return response.data;
};

// Create a new category offer
const createCategoryOffer = async (offerData) => {
  const response = await API.post(API_URL, offerData);
  return response.data;
};

// Update a category offer
const updateCategoryOffer = async (id, offerData) => {
  const response = await API.put(`${API_URL}/${id}`, offerData);
  return response.data;
};

// Delete a category offer
const deleteCategoryOffer = async (id) => {
  const response = await API.delete(`${API_URL}/${id}`);
  return response.data;
};

const categoryOfferService = {
  getAllCategoryOffers,
  getCategoryOfferById,
  createCategoryOffer,
  updateCategoryOffer,
  deleteCategoryOffer
};

export default categoryOfferService;
