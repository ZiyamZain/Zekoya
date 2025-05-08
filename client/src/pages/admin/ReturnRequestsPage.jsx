import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import { getReturnRequests, processReturnRequest } from '../../features/order/orderSlice';
import { toast } from 'react-toastify';

const ReturnRequestsPage = () => {
  const dispatch = useDispatch();
  const { returnRequests, isLoading } = useSelector((state) => state.order);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('Requested');
  
  const requestsPerPage = 10;
  
  useEffect(() => {
    dispatch(getReturnRequests({ 
      page: currentPage, 
      limit: requestsPerPage,
      status: statusFilter
    }));
  }, [dispatch, currentPage, statusFilter]);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleReturnRequest = (orderId, itemId, approved) => {
    dispatch(processReturnRequest({ 
      orderId, 
      itemId, 
      approved,
      note: approved ? 'Return request approved' : 'Return request rejected'
    }))
      .unwrap()
      .then(() => {
        toast.success(`Return request ${approved ? 'approved' : 'rejected'}`);
        dispatch(getReturnRequests({ 
          page: currentPage, 
          limit: requestsPerPage,
          status: statusFilter
        }));
      })
      .catch((error) => {
        toast.error(error || 'Failed to process return request');
      });
  };
  
  const getReturnStatusBadgeClass = (status) => {
    switch (status) {
      case 'Requested':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Return Requests</h1>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="w-full md:w-1/4">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="Requested">Requested</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Return Requests Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Requested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {returnRequests && returnRequests.length > 0 ? (
                  returnRequests.map((request) => (
                    <tr key={`${request.orderId}-${request.itemId}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{request.orderId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img className="h-10 w-10 rounded-full" src={request.productImage || '/placeholder.png'} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{request.productName}</div>
                            <div className="text-sm text-gray-500">Size: {request.size}, Qty: {request.quantity}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.customerName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{request.reason}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(request.requestDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getReturnStatusBadgeClass(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          to={`/admin/orders/${request.orderId}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <FaEye className="inline mr-1" /> View Order
                        </Link>
                        
                        {request.status === 'Requested' && (
                          <div className="flex justify-end space-x-2 mt-2">
                            <button
                              onClick={() => handleReturnRequest(request.orderId, request.itemId, true)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <FaCheck className="inline mr-1" /> Approve
                            </button>
                            <button
                              onClick={() => handleReturnRequest(request.orderId, request.itemId, false)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTimes className="inline mr-1" /> Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No return requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {returnRequests && returnRequests.totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * requestsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * requestsPerPage, returnRequests.totalCount)}
                  </span>{' '}
                  of <span className="font-medium">{returnRequests.totalCount}</span> results
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 border rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === returnRequests.totalPages}
                  className={`px-3 py-1 border rounded-md ${currentPage === returnRequests.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnRequestsPage;
