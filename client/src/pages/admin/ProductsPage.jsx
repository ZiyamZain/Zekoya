import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaEye,
  FaEyeSlash,
  FaStar,
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

const BACKEND_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5001';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const { products, total, isLoading } = useSelector(
    (state) => state.adminProducts
  );
  const limit = 10;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // Add state for showEditModal
  const [selectedProduct, setSelectedProduct] = useState(null); // Add state for selectedProduct

  useEffect(() => {
    dispatch(getProducts({ page, search, limit }));
  }, [dispatch, page, search, limit]);

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast.success("Product deleted successfully");
      setConfirmDelete(null);
    } catch (error) {
      toast.error(error);
    }
  };

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
                              src={product.images && product.images[0] ? (product.images[0].startsWith('/uploads') ? `${BACKEND_URL}${product.images[0]}` : product.images[0]) : "/default-product.png"}
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
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{products.length}</span> of{" "}
                <span className="font-medium">{total}</span> products
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-3 py-1 rounded-md ${
                    page === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  Previous
                </button>
                {Array.from({ length: Math.ceil(total / 10) }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-1 rounded-md ${
                      page === i + 1
                        ? "bg-gradient-to-r from-red-500 to-orange-400 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * 10 >= total}
                  className={`px-3 py-1 rounded-md ${
                    page * 10 >= total
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
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
