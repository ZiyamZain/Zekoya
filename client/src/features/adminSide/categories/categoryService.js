import adminAxios from '../../../utils/adminAxiosConfig';

// Base URL is already set in adminAxios, so we just need the path

const getCategories = async (params = {}) => {
  // Always include admin=true for admin side categories page
  const queryParams = { 
    limit: params.limit || 5, 
    page: params.page || 1,
    search: params.search || '',
    admin: true 
  };
  // adminAxios will automatically add the auth header
  const response = await adminAxios.get('/categories', { params: queryParams });
  return response.data;
};

const addCategory = async (formData) => {
  const config = {
    headers: {
      // Authorization header is automatically added by adminAxios
      "Content-Type": "multipart/form-data",
    },
  };

  const response = await adminAxios.post('/categories', formData, config);
  return response.data;
};


const updateCategory = async (id, formData) => {
  const config = {
    headers: {
      // Authorization header is automatically added by adminAxios
      "Content-Type": "multipart/form-data",
    },
  };

  const response = await adminAxios.put(`/categories/${id}`, formData, config);
  return response.data;
};


const deleteCategory = async (id) => {
  // adminAxios will automatically add the auth header
  const response = await adminAxios.delete(`/categories/${id}`);
  return response.data;
};


const toggleCategoryListing = async (id) => {
  // adminAxios will automatically add the auth header
  const response = await adminAxios.patch(`/categories/${id}/toggle-listing`, {});
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
