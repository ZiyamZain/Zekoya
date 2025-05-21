import API from '../../../utils/axiosConfig';

const API_URL = '/api/admin/offers/referral';

// Get all referral offers
const getAllReferralOffers = async (params = {}) => {
  const response = await API.get(API_URL, { params });
  return response.data;
};

// Get referral offer by ID
const getReferralOfferById = async (id) => {
  const response = await API.get(`${API_URL}/${id}`);
  return response.data;
};

// Create a new referral offer
const createReferralOffer = async (offerData) => {
  const response = await API.post(API_URL, offerData);
  return response.data;
};

// Update a referral offer
const updateReferralOffer = async (id, offerData) => {
  const response = await API.put(`${API_URL}/${id}`, offerData);
  return response.data;
};

// Delete a referral offer
const deleteReferralOffer = async (id) => {
  const response = await API.delete(`${API_URL}/${id}`);
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
