import axios from "axios";

const API_URL = "http://localhost:5001/api/admin/products";

const getProducts = async (params, token) => {
  const queryParams = { ...params, limit: params.limit || 10 };
  const config = token ? { headers: { Authorization: `Bearer ${token}` }, params: queryParams } : { params: queryParams };
  const response = await axios.get(API_URL, config);
  console.log('products object' , response.data);
  return response.data;
};

const getFeaturedProducts = async () => {
  const response = await axios.get(`${API_URL}/featured`);
  return response.data;
};

const addProduct = async (formData, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    const response = await axios.post(`${API_URL}/add`, formData, config);
    return response.data;
  } catch (error) {
    console.error("Error in addProduct:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to add product");
  }
};


const editProduct = async (id, productData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(`${API_URL}/${id}`, productData, config);
  return response.data;
};

const deleteProduct = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(`${API_URL}/delete/${id}`, config);
  return response.data;
};


const toggleProductListing = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.patch(`${API_URL}/${id}/toggle-listing`, {}, config);
  return response.data;
};


const toggleProductFeatured = async (productId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.patch(
    `${API_URL}/${productId}/toggle-featured`,
    {},
    config
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