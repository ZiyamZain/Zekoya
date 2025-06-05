import { categoryAxios } from '../../utils/userAxiosConfig'; // Use the configured categoryAxios instance

const getAllCategories = async () => {
  // Use relative path; categoryAxios prepends '/api/categories'
  const response = await categoryAxios.get('/');
  return response.data;
};

const getCategoryById = async (id) => {
  // Use relative path
  const response = await categoryAxios.get(`/${id}`);
  return response.data;
};

const categoryService = {
  getAllCategories,
  getCategoryById,
};

export default categoryService; 