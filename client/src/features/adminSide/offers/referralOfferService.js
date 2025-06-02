import adminAxios from '../../../utils/adminAxiosConfig';

// Base URL is already set in adminAxios, so we just need the path

// Get all referral offers
const getAllReferralOffers = async (params = {}) => {
  // adminAxios will automatically add auth header
  const response = await adminAxios.get('/offers/referral', { params });
  return response.data;
};

// Get referral offer by ID
const getReferralOfferById = async (id) => {
  // adminAxios will automatically add auth header
  const response = await adminAxios.get(`/offers/referral/${id}`);
  return response.data;
};

// Create a new referral offer
const createReferralOffer = async (offerData) => {
  // adminAxios will automatically add auth header
  const response = await adminAxios.post('/offers/referral', offerData);
  return response.data;
};

// Update a referral offer
const updateReferralOffer = async (id, offerData) => {
  // adminAxios will automatically add auth header
  const response = await adminAxios.put(`/offers/referral/${id}`, offerData);
  return response.data;
};

// Delete a referral offer
const deleteReferralOffer = async (id) => {
  // adminAxios will automatically add auth header
  const response = await adminAxios.delete(`/offers/referral/${id}`);
  return response.data;
};

const referralOfferService = {
  getAllReferralOffers,
  getReferralOfferById,
  createReferralOffer,
  updateReferralOffer,
  deleteReferralOffer
};

export default referralOfferService;
