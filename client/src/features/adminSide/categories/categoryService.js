import axios from "axios";

const API_URL = "http://localhost:5001/api/admin/categories";

const getCategories = async (params = {}) => {
  // Always include admin=true for admin side categories page
  const queryParams = { 
    limit: params.limit || 5, 
    page: params.page || 1,
    search: params.search || '',
    admin: true 
  };
  const response = await axios.get(API_URL, { params: queryParams });
  return response.data;
};

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


const deleteCategory = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(`${API_URL}/${id}`, config);
  return response.data;
};


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
