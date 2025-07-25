import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaEye,
  FaEyeSlash,
  FaStar,
  FaChevronDown,
  FaChevronUp,
  FaTshirt
} from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import {
  getProducts,
  deleteProduct,
  toggleProductListing,
  toggleProductFeatured,
} from "../../features/adminSide/products/productSlice.js";
import { toast } from "react-toastify";
import AddProductForm from "../../components/admin/AddProductForm";
import EditProductForm from "../../components/admin/EditProductForm"; // Import EditProductForm
import { getBaseImageUrl } from "../../utils/urlUtils"; // Adjust path as needed
import Pagination from "../../components/common/Pagination";

const ProductsPage = () => {
  const baseImageUrl = getBaseImageUrl();
  const dispatch = useDispatch();
  const { products, total, isLoading, refreshTrigger } = useSelector(
    (state) => state.adminProducts
  );
  const limit = 5;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); 
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [expandedStocks, setExpandedStocks] = useState({}); 

  useEffect(() => {
    dispatch(getProducts({ page, search, limit }));
  }, [dispatch, page, search, limit, refreshTrigger]);

  const handleToggleListing = async (id) => {
    try {
      await dispatch(toggleProductListing(id)).unwrap();
      toast.success("Product listing status updated");
    } catch (error) {
      toast.error(error);
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await dispatch(toggleProductFeatured(id)).unwrap();
      toast.success("Product featured status updated");
    } catch (error) {
      toast.error(error);
    }
  };

  const handleAddProductSuccess = () => {
    setShowAddForm(false);
    dispatch(getProducts({ page, search, limit })); // Refresh product list
  };

  // Edit handler
  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const toggleStockDetails = (productId) => {
    setExpandedStocks(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  return (
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-400">
            Products Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all products in your store
          </p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-400 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-orange-500 transition-all shadow-md"
          >
            <MdAdd size={18} />
            <span className="font-medium">Add Product</span>
          </button>
        )}
      </div>

      {showAddForm ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <AddProductForm
            onCancel={() => setShowAddForm(false)}
            onSuccess={handleAddProductSuccess}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Search Bar */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative">
              <input
                type="text"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Search products..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            {search && (
              <button
                onClick={() => { setSearch(""); setPage(1); }}
                className="ml-2 px-2 py-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-300"
              >
                Clear
              </button>
            )}
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Featured
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Stock
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Loading products...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              src={
                                product.images && product.images.length > 0
                                  ? typeof product.images[0] === 'object' && product.images[0] !== null && product.images[0].url
                                    ? product.images[0].url // Cloudinary image object with direct URL
                                    : typeof product.images[0] === 'string'
                                      ? product.images[0].startsWith('http') // Already an absolute URL
                                        ? product.images[0]
                                        : `${baseImageUrl}${product.images[0].startsWith('/') ? '' : '/'}${product.images[0]}` // Relative path, prepend base
                                      : "/default-product.png" // Fallback if images[0] is not object or string
                                  : "/default-product.png" // Fallback if no images array or empty
                              }
                              alt={product.name}
                              className="h-10 w-10 rounded object-cover border border-gray-200"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {product._id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.category && typeof product.category === 'object' && product.category.name
                            ? product.category.name
                            : typeof product.category === 'string'
                            ? product.category
                            : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleListing(product._id)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.isListed
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.isListed ? "Listed" : "Unlisted"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleFeatured(product._id)}
                          className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            product.isFeatured
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {product.isFeatured && (
                            <FaStar className="mr-1 text-yellow-500" />
                          )}
                          {product.isFeatured ? "Featured" : "Regular"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          ₹{product.price}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative">
                          <div className="flex items-center">
                            <div className={`text-sm font-medium ${product.totalStock > 10 ? 'text-green-600' : product.totalStock > 0 ? 'text-orange-500' : 'text-red-600'}`}>
                              {product.totalStock || 0}
                            </div>
                            <button 
                              onClick={() => toggleStockDetails(product._id)}
                              className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                              {expandedStocks[product._id] ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                            </button>
                          </div>
                          
                          {expandedStocks[product._id] && (
                            <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-md shadow-lg p-3 w-48">
                              <h4 className="text-xs font-semibold text-gray-500 mb-2">Size-specific Stock</h4>
                              <div className="space-y-1">
                                {product.sizes && product.sizes.map((sizeItem) => (
                                  <div key={sizeItem.size} className="flex justify-between items-center">
                                    <div className="flex items-center">
                                      <FaTshirt className="mr-1 text-gray-400" size={12} />
                                      <span className="text-sm font-medium">{sizeItem.size}</span>
                                    </div>
                                    <span className={`text-sm ${sizeItem.stock > 5 ? 'text-green-600' : sizeItem.stock > 0 ? 'text-orange-500' : 'text-red-600'}`}>
                                      {sizeItem.stock}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleToggleListing(product._id)}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
                            title={product.isListed ? "Unlist" : "List"}
                          >
                            {product.isListed ? <FaEye /> : <FaEyeSlash />}
                          </button>
                          <button
                            onClick={() => handleEdit(product)} // Update the Edit button
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(product._id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && products.length > 0 && (
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(total / limit)}
              onPageChange={setPage}
            />
          )}
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  dispatch(deleteProduct(confirmDelete))
                    .unwrap()
                    .then(() => {
                      toast.success("Product deleted successfully");
                      dispatch(getProducts({ page, search, limit }));
                    })
                    .catch((error) => {
                      toast.error(error?.message || "Failed to delete product");
                    });
                  setConfirmDelete(null);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Edit Product</h2>
            <EditProductForm
              product={selectedProduct}
              onCancel={() => setShowEditModal(false)}
              onSuccess={() => {
                setShowEditModal(false);
                setSelectedProduct(null);
                dispatch(getProducts({ page, search, limit }));
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
