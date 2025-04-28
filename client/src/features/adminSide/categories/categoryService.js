import axios from "axios";

const API_URL = "http://localhost:5001/api/admin/categories";

// Get categories
const getCategories = async (params) => {
  // Ensure default limit if not provided
  const queryParams = { ...params, limit: params.limit || 5 };
  const response = await axios.get(API_URL, { params: queryParams });
  return response.data;
};

// Add category
const addCategory = async (formData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  };

  const response = await axios.post(API_URL, formData, config);
  return response.data;
};

// Update category
const updateCategory = async (id, formData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  };

  const response = await axios.put(`${API_URL}/${id}`, formData, config);
  return response.data;
};

// Delete category
const deleteCategory = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(`${API_URL}/${id}`, config);
  return response.data;
};

// Toggle category listing status
const toggleCategoryListing = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.patch(`${API_URL}/${id}/toggle-listing`, {}, config);
  return response.data;
};

const categoryService = {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryListing,
};

export default categoryService;
