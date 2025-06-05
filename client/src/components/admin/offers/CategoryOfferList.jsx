import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes } from 'react-icons/fa';

import { 
  getAllCategoryOffers, 
  deleteCategoryOffer, 
  reset,
  resetForm 
} from '../../../features/adminSide/offers/categoryOfferSlice';

const CategoryOfferList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  
  const { 
    categoryOffers, 
    isLoading, 
    isError, 
    message,
    totalPages 
  } = useSelector(state => state.categoryOffer);

  useEffect(() => {
    setPage(1); // Reset to page 1 when search term changes
  }, [searchTerm]);

  useEffect(() => {
    dispatch(getAllCategoryOffers({ page, search: searchTerm }));
    
    return () => {
      dispatch(reset());
    };
  }, [dispatch, page, searchTerm]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
  }, [isError, message]);

  const handleSearch = () => {
    setPage(1);
    dispatch(getAllCategoryOffers({ page: 1, search: searchTerm }));
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(1);
    dispatch(getAllCategoryOffers({ page: 1 }));
  };

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleDeleteClick = (id) => {
    setSelectedOfferId(id);
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    dispatch(deleteCategoryOffer(selectedOfferId))
      .unwrap()
      .then(() => {
        toast.success('Category offer deleted successfully');
        setConfirmDelete(false);
        dispatch(getAllCategoryOffers({ page, search: searchTerm }));
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
    setSelectedOfferId(null);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Category Offers</h1>
        <button 
          onClick={() => {
            dispatch(resetForm());
            navigate('create');
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
        >
          <FaPlus className="mr-2" /> Add New Offer
        </button>
      </div>

      <div className="mb-6">
        <div className="relative w-64">
          <input
            type="text"
            className="w-full p-2 pr-10 border border-gray-300 rounded"
            placeholder="Search Categories"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <div className="absolute right-0 top-0 h-full flex items-center pr-2">
            {searchTerm && (
              <button 
                onClick={handleClearSearch}
                className="text-gray-500 hover:text-gray-700 mr-1"
              >
                <FaTimes />
              </button>
            )}
            <button 
              onClick={handleSearch}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaSearch />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoryOffers && categoryOffers.length > 0 ? (
                  categoryOffers.map((offer) => (
                    <tr key={offer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {offer.category ? (
                          <span>{offer.category.name}</span>
                        ) : (
                          <span className="text-gray-500">Category not found</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{offer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {offer.discountType === 'percentage' 
                          ? `${offer.discountValue}%` 
                          : `₹${offer.discountValue}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{format(new Date(offer.startDate), 'dd/MM/yyyy')}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{format(new Date(offer.endDate), 'dd/MM/yyyy')}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${offer.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                        >
                          {offer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-4">
                          <Link 
                            to={`edit/${offer._id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaEdit size={18} />
                          </Link>
                          <button 
                            onClick={() => handleDeleteClick(offer._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No category offers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handleChangePage(page > 1 ? page - 1 : 1)}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleChangePage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${page === i + 1 ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handleChangePage(page < totalPages ? page + 1 : totalPages)}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Delete Category Offer</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this category offer? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryOfferList;
