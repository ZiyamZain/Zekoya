import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import { getCategories, toggleCategoryListing, deleteCategory } from "../../features/adminSide/categories/categorySlice";
import CategoryModal from "../../components/admin/CategoryModal";
import AddCategoryModal from "../../components/admin/AddCategoryModal";
import { toast } from "react-toastify";
import { createSelector } from "@reduxjs/toolkit";

// Define the backend URL at the top of the file
const BACKEND_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5001';

const CategoriesPage = () => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Create a memoized selector
  const selectCategoriesData = createSelector(
    (state) => state.adminCategories,
    (adminCategories) => ({
      categories: adminCategories.categories || [],
      total: adminCategories.total || 0,
      isLoading: adminCategories.isLoading,
      isError: adminCategories.isError,
      message: adminCategories.message,
      refreshTrigger: adminCategories.refreshTrigger,
    })
  );

  // Use the memoized selector
  const {
    categories,
    total,
    isLoading,
    isError,
    message,
    refreshTrigger,
  } = useSelector(selectCategoriesData);

  const limit = 5;

  useEffect(() => {
    dispatch(getCategories({ page, search, limit }));
  }, [dispatch, page, search, limit, refreshTrigger]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
      // Reset the error state after showing the toast
      dispatch({ type: 'categories/reset' });
    }
  }, [isError, message, dispatch]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const clearSearch = () => {
    setSearch("");
    setPage(1);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setSelectedCategory(null);
    setShowEditModal(false);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleToggleListing = async (category) => {
    try {
      // Use the new toggleCategoryListing thunk
      await dispatch(toggleCategoryListing(category._id)).unwrap();
      toast.success(
        `Category ${category.isListed ? "unlisted" : "listed"} successfully`
      );
    } catch (error) {
      toast.error(error.message || "Failed to update category status");
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-400">
            Categories Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Organize your products with categories
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={handleSearch}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            {search && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                title="Clear search"
                type="button"
              >
                ×
              </button>
            )}
          </div>

          {/* Add Category Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-400 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-orange-500 transition-all shadow-md"
          >
            <MdAdd size={18} />
            <span className="font-medium">Add Category</span>
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No categories found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Picture
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    List/Unlist
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr
                    key={category._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            src={category.image ? (category.image.startsWith('/uploads') ? `${BACKEND_URL}${category.image}` : category.image) : "/default-category.png"}
                            alt={category.name}
                            className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleListing(category)}
                        className={`px-3 py-1 rounded-md text-white ${
                          category.isListed
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        {category.isListed ? "Unlist" : "List"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {category.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          category.isListed
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {category.isListed ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(category._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && total > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{(page - 1) * limit + 1}</span>{" "}
              to{" "}
              <span className="font-medium">{Math.min(page * limit, total)}</span>{" "}
              of <span className="font-medium">{total}</span> categories
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className={`px-3 py-1 rounded-md ${
                  page === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                <FaChevronLeft />
              </button>
              {Array.from({ length: Math.ceil(total / limit) }, (_, i) => (
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
                onClick={() =>
                  setPage((prev) => Math.min(Math.ceil(total / limit), prev + 1))
                }
                disabled={page === Math.ceil(total / limit)}
                className={`px-3 py-1 rounded-md ${
                  page === Math.ceil(total / limit)
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this category? Products in this
              category will be affected.
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
                  dispatch(deleteCategory(confirmDelete))
                    .unwrap()
                    .then(() => {
                      toast.success("Category deleted successfully");
                      dispatch(getCategories({ page, search, limit }));
                    })
                    .catch((error) => {
                      toast.error(error?.message || "Failed to delete category");
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

      {/* Add Category Modal */}
      {showAddModal && <AddCategoryModal onClose={handleCloseAddModal} />}

      {/* Edit Category Modal */}
      {showEditModal && selectedCategory && (
        <CategoryModal
          category={selectedCategory}
          onClose={handleCloseEditModal}
        />
      )}
    </div>
  );
};

export default CategoriesPage;
