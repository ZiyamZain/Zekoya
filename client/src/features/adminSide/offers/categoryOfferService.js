import adminAxios from '../../../utils/adminAxiosConfig';

// Base URL is already set in adminAxios, so we just need the path

// Get all category offers
const getAllCategoryOffers = async (params = {}) => {
  // adminAxios will automatically add auth header
  const response = await adminAxios.get('/offers/category', { params });
  return response.data;
};

// Get category offer by ID
const getCategoryOfferById = async (id) => {
  // adminAxios will automatically add auth header
  const response = await adminAxios.get(`/offers/category/${id}`);
  return response.data;
};

// Create a new category offer
const createCategoryOffer = async (offerData) => {
  // adminAxios will automatically add auth header
  const response = await adminAxios.post('/offers/category', offerData);
  return response.data;
};

// Update a category offer
const updateCategoryOffer = async (id, offerData) => {
  // adminAxios will automatically add auth header
  const response = await adminAxios.put(`/offers/category/${id}`, offerData);
  return response.data;
};

// Delete a category offer
const deleteCategoryOffer = async (id) => {
  // adminAxios will automatically add auth header
  const response = await adminAxios.delete(`/offers/category/${id}`);
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
