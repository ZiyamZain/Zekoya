import adminAxios from '../../../utils/adminAxiosConfig';

// Base URL is already set in adminAxios, so we just need the path

const getProducts = async (params) => {
  const queryParams = { ...params, limit: params.limit || 10 };
  // adminAxios will automatically add the auth header
  const response = await adminAxios.get('/products', { params: queryParams });
  return response.data;
};

const getFeaturedProducts = async () => {
  const response = await adminAxios.get('/products/featured');
  return response.data;
};

const addProduct = async (formData) => {
  try {
    const config = {
      headers: {
        // Authorization header is automatically added by adminAxios
        "Content-Type": "multipart/form-data",
      },
    };

    const response = await adminAxios.post('/products/add', formData, config);
    return response.data;
  } catch (error) {
    console.error("Error in addProduct:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to add product");
  }
};


const editProduct = async (id, productData) => {
  // adminAxios will automatically add the auth header
  const response = await adminAxios.put(`/products/${id}`, productData);
  return response.data;
};

const deleteProduct = async (id) => {
  // adminAxios will automatically add the auth header
  const response = await adminAxios.delete(`/products/${id}`);
  return response.data;
};


const toggleProductListing = async (id) => {
  // adminAxios will automatically add the auth header
  const response = await adminAxios.patch(`/products/${id}/toggle-listing`, {});
  return response.data;
};


const toggleProductFeatured = async (productId) => {
  // adminAxios will automatically add the auth header
  const response = await adminAxios.patch(
    `/products/${productId}/toggle-featured`,
    {}
  );
  return response.data;
};

const productService = {
  getProducts,
  getFeaturedProducts,
  addProduct,
  editProduct,
  deleteProduct,
  toggleProductListing,
  toggleProductFeatured,
};

export default productService; 