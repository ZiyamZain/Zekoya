import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { getOrderDetails, updateOrderStatus, processReturnRequest, generateInvoice, refreshOrders } from "../../features/adminOrder/adminOrderSlice";
import { FaBox, FaShippingFast, FaCheckCircle, FaTimesCircle, FaArrowLeft, FaFileInvoice } from "react-icons/fa";
import { toast } from "react-toastify";

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl transform transition-all duration-300 border border-gray-200">
        <h3 className="text-xl font-bold mb-3 text-gray-800 border-b pb-3">{title}</h3>
        <p className="text-gray-600 mb-6 py-2">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { order, isLoading } = useSelector((state) => state.adminOrder);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [statusError, setStatusError] = useState("");
  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null
  });

  useEffect(() => {
    dispatch(getOrderDetails(id));
  }, [dispatch, id]);


  useEffect(() => {
    if (order) {
      setSelectedStatus(order.orderStatus);
    }
  }, [order]);

  const handleStatusUpdateClick = () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }

    setStatusError('');

    const statusOrder = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    const currentIndex = statusOrder.indexOf(order.orderStatus);
    const newIndex = statusOrder.indexOf(newStatus);
    

    if (order.orderStatus === 'Delivered' && newStatus === 'Cancelled') {
      setStatusError('Cannot cancel an order that has been delivered');
      return;
    }

    if (newIndex < currentIndex && newStatus !== 'Cancelled') {
      setStatusError(`Cannot change status from ${order.orderStatus} to ${newStatus}`);
      return;
    }
    

    setModalInfo({
      show: true,
      title: 'Confirm Status Update',
      message: `Are you sure you want to update the order status from ${order.orderStatus} to ${newStatus}?`,
      onConfirm: () => {
        dispatch(updateOrderStatus({ 
          orderId: id, 
          status: newStatus,
          note: statusNote
        }))
          .unwrap()
          .then(() => {
            toast.success(`Order status updated to ${newStatus}`);
            setNewStatus('');
            setStatusNote('');
            setStatusError('');
            dispatch(getOrderDetails(id));
            dispatch(refreshOrders());
            setModalInfo(prev => ({ ...prev, show: false }));
          })
          .catch((error) => {
            toast.error(error || 'Failed to update order status');
            setModalInfo(prev => ({ ...prev, show: false }));
          });
      }
    });
  };

  const handleStatusChange = (status) => {

    const statusOrder = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    const currentIndex = statusOrder.indexOf(order.orderStatus);
    const newIndex = statusOrder.indexOf(status);
    
    if (order.orderStatus === 'Delivered' && status === 'Cancelled') {
      toast.error('Cannot cancel an order that has been delivered');
      return;
    }
    

    if (newIndex < currentIndex && status !== 'Cancelled') {
      toast.error(`Cannot change status from ${order.orderStatus} to ${status}`);
      return;
    }
    

    setModalInfo({
      show: true,
      title: 'Confirm Status Change',
      message: `Are you sure you want to change the order status to ${status}?`,
      onConfirm: () => {
        dispatch(updateOrderStatus({ orderId: id, status }))
          .unwrap()
          .then(() => {
            toast.success(`Order status updated to ${status}`);
            dispatch(getOrderDetails(id));
            dispatch(refreshOrders());
            setModalInfo(prev => ({ ...prev, show: false }));
          })
          .catch((error) => {
            toast.error(error || 'Failed to update order status');
            setModalInfo(prev => ({ ...prev, show: false }));
          });
      }
    });
  };


  const handleCancelOrderClick = () => {
    setModalInfo({
      show: true,
      title: 'Confirm Cancellation',
      message: 'Are you sure you want to cancel this order? This action cannot be undone.',
      onConfirm: () => {
        dispatch(updateOrderStatus({ 
          orderId: id, 
          status: 'Cancelled',
          note: 'Cancelled by admin'
        }))
          .unwrap()
          .then(() => {
            toast.success('Order cancelled successfully');
            dispatch(getOrderDetails(id));
            setModalInfo(prev => ({ ...prev, show: false }));
          })
          .catch((error) => {
            toast.error(error || 'Failed to cancel order');
            setModalInfo(prev => ({ ...prev, show: false }));
          });
      }
    });
  };

  const handleReturnRequest = (itemId, action, item) => {

    const refundAmount = action === 'accept' ? item.price * item.quantity : 0;
    
    setModalInfo({
      show: true,
      title: `Confirm ${action === 'accept' ? 'Acceptance' : 'Rejection'} of Return`,
      message: action === 'accept' 
        ? `Are you sure you want to accept this return request? 

A refund of ₹${refundAmount.toFixed(2)} will be credited to the customer's wallet.

This action will also add ${item.quantity} item(s) back to inventory.`
        : `Are you sure you want to reject this return request? The customer will be notified that their return request has been rejected.`,
      onConfirm: () => {
        dispatch(processReturnRequest({ orderId: id, itemId, action }))
          .unwrap()
          .then(() => {
            if (action === 'accept') {
              toast.success(`Return accepted and ₹${refundAmount.toFixed(2)} refunded to customer's wallet`);
            } else {
              toast.success('Return request rejected successfully');
            }
            dispatch(getOrderDetails(id));
            dispatch(refreshOrders());
            setModalInfo(prev => ({ ...prev, show: false }));
          })
          .catch((error) => {
            toast.error(error || `Failed to ${action} return request`);
            setModalInfo(prev => ({ ...prev, show: false }));
          });
      }
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-gray-100 text-gray-800";
      case "Processing":
        return "bg-yellow-100 text-yellow-800";
      case "Shipped":
        return "bg-blue-100 text-blue-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }


  const closeModal = () => {
    setModalInfo(prev => ({ ...prev, show: false }));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalInfo.show}
        onClose={closeModal}
        onConfirm={modalInfo.onConfirm}
        title={modalInfo.title}
        message={modalInfo.message}
      />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <div className="flex space-x-3">
              <Link 
                to="/admin/orders"
                className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 inline-flex items-center transition-colors duration-200 shadow-sm"
              >
                <FaArrowLeft className="mr-2 text-gray-500" /> Back to Orders
              </Link>
              
              <button 
                onClick={() => {
                  dispatch(generateInvoice(order?._id))
                    .unwrap()
                    .then(() => {
                      toast.success('Invoice downloaded successfully');
                    })
                    .catch((error) => {
                      toast.error(error || 'Failed to download invoice');
                    });
                }}
                className="bg-blue-50 text-blue-700 border border-blue-200 py-2 px-4 rounded-lg hover:bg-blue-100 inline-flex items-center transition-colors duration-200 shadow-sm"
              >
                <FaFileInvoice className="mr-2 text-blue-600" /> Download Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">

        
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Order Reference</div>
                <h1 className="text-2xl font-bold text-gray-800">
                  #{order.orderId}
                </h1>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-sm text-gray-500 mb-1">Order Date</div>
                <div className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <span
                className={'px-4 py-1.5 text-sm font-semibold rounded-full ' + getStatusBadgeClass(order.orderStatus)}
              >
                {order.orderStatus}
              </span>
            </div>
          </div>
          {/* Order Status Timeline */}
          <div className="px-6 py-8">
            <h2 className="text-lg font-semibold mb-6">Order Status Timeline</h2>
            <div className="flex flex-wrap justify-between items-center">
              <div className="flex flex-col items-center mb-4 w-1/5">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${selectedStatus === "Pending" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"} ${order.orderStatus !== "Pending" && order.orderStatus !== "Processing" ? "opacity-50" : ""}`}>
                  <FaBox className="text-xl" />
                </div>
                <button
                  onClick={() => handleStatusChange("Pending")}
                  disabled={order.orderStatus !== "Pending" && order.orderStatus !== "Processing"}
                  className={`text-sm font-medium ${selectedStatus === "Pending" ? "text-blue-600" : "text-gray-500"} ${order.orderStatus !== "Pending" && order.orderStatus !== "Processing" ? "opacity-50 cursor-not-allowed" : "hover:text-blue-700"}`}
                >
                  Pending
                </button>
              </div>
              
              <div className="flex-1 h-1 mx-2 bg-gray-200 self-start mt-7 hidden sm:block"></div>
              
              <div className="flex flex-col items-center mb-4 w-1/5">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${selectedStatus === "Processing" ? "bg-yellow-100 text-yellow-600" : "bg-gray-100 text-gray-400"} ${order.orderStatus === "Cancelled" || order.orderStatus === "Shipped" || order.orderStatus === "Delivered" ? "opacity-50" : ""}`}>
                  <FaBox className="text-xl" />
                </div>
                <button
                  onClick={() => handleStatusChange("Processing")}
                  disabled={order.orderStatus === "Cancelled" || order.orderStatus === "Shipped" || order.orderStatus === "Delivered"}
                  className={`text-sm font-medium ${selectedStatus === "Processing" ? "text-yellow-600" : "text-gray-500"} ${order.orderStatus === "Cancelled" || order.orderStatus === "Shipped" || order.orderStatus === "Delivered" ? "opacity-50 cursor-not-allowed" : "hover:text-yellow-700"}`}
                >
                  Processing
                </button>
              </div>
              
              <div className="flex-1 h-1 mx-2 bg-gray-200 self-start mt-7 hidden sm:block"></div>
              
              <div className="flex flex-col items-center mb-4 w-1/5">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${selectedStatus === "Shipped" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"} ${order.orderStatus === "Cancelled" || order.orderStatus === "Pending" || order.orderStatus === "Delivered" ? "opacity-50" : ""}`}>
                  <FaShippingFast className="text-xl" />
                </div>
                <button
                  onClick={() => handleStatusChange("Shipped")}
                  disabled={order.orderStatus === "Cancelled" || order.orderStatus === "Pending" || order.orderStatus === "Delivered"}
                  className={`text-sm font-medium ${selectedStatus === "Shipped" ? "text-blue-600" : "text-gray-500"} ${order.orderStatus === "Cancelled" || order.orderStatus === "Pending" || order.orderStatus === "Delivered" ? "opacity-50 cursor-not-allowed" : "hover:text-blue-700"}`}
                >
                  Shipped
                </button>
              </div>
              
              <div className="flex-1 h-1 mx-2 bg-gray-200 self-start mt-7 hidden sm:block"></div>
              
              <div className="flex flex-col items-center mb-4 w-1/5">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${selectedStatus === "Delivered" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"} ${order.orderStatus === "Cancelled" || order.orderStatus === "Pending" || order.orderStatus === "Processing" ? "opacity-50" : ""}`}>
                  <FaCheckCircle className="text-xl" />
                </div>
                <button
                  onClick={() => handleStatusChange("Delivered")}
                  disabled={order.orderStatus === "Cancelled" || order.orderStatus === "Pending" || order.orderStatus === "Processing"}
                  className={`text-sm font-medium ${selectedStatus === "Delivered" ? "text-green-600" : "text-gray-500"} ${order.orderStatus === "Cancelled" || order.orderStatus === "Pending" || order.orderStatus === "Processing" ? "opacity-50 cursor-not-allowed" : "hover:text-green-700"}`}
                >
                  Delivered
                </button>
              </div>
              
              <div className="flex-1 h-1 mx-2 bg-gray-200 self-start mt-7 hidden sm:block"></div>
              
              <div className="flex flex-col items-center mb-4 w-1/5">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${selectedStatus === "Cancelled" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-400"} ${order.orderStatus === "Delivered" ? "opacity-50" : ""}`}>
                  <FaTimesCircle className="text-xl" />
                </div>
                <button
                  onClick={() => handleStatusChange("Cancelled")}
                  disabled={order.orderStatus === "Delivered"}
                  className={`text-sm font-medium ${selectedStatus === "Cancelled" ? "text-red-600" : "text-gray-500"} ${order.orderStatus === "Delivered" ? "opacity-50 cursor-not-allowed" : "hover:text-red-700"}`}
                >
                  Cancelled
                </button>
              </div>
            </div>
          </div>
          

          <div className="mb-8 border-t border-gray-200">
            <div className="px-6 py-6 bg-gray-50">
              <h2 className="text-lg font-semibold mb-4">Update Order Status</h2>
              {statusError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4 flex items-start">
                  <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                  <span>{statusError}</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select New Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2">Status Note (Optional)</label>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Add a note about this status change"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-4">
                <button
                  onClick={handleStatusUpdateClick}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${!newStatus ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'}`}
                  disabled={!newStatus}
                >
                  Update Status
                </button>
                
                {order && order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && (
                  <button
                    onClick={handleCancelOrderClick}
                    className="bg-white border border-red-500 text-red-600 px-6 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors duration-200"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
          

          <div className="px-6 py-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  Customer Details
                </h2>
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                    <p className="font-medium text-gray-800">{order.user?.name || 'N/A'}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Email Address</p>
                    <p className="font-medium text-gray-800">{order.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                    <p className="font-medium text-gray-800">{order.user?.phone || order.shippingAddress?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  Shipping Address
                </h2>
                <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                  {order.shippingAddress ? (
                    <>
                      <p className="mb-2 font-medium text-gray-800">{order.shippingAddress.address}</p>
                      <p className="mb-2 text-gray-700">
                        {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                        {order.shippingAddress.postalCode}
                      </p>
                      <p className="text-gray-700">{order.shippingAddress.country}</p>
                    </>
                  ) : (
                    <p className="text-gray-500">No shipping address provided</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="px-6 py-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              Order Items
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto max-h-[500px]">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.orderItems.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 h-16 w-16">
                              {item.product && item.product.images && item.product.images.length > 0 ? (
                                <img
                                  src={`http://localhost:5001${item.product.images[0]}`}
                                  alt={item.product.name}
                                  className="h-16 w-16 object-cover rounded-md"
                                />
                              ) : (
                                <div className="h-16 w-16 bg-gray-200 flex items-center justify-center rounded-md">
                                  <span className="text-xs text-gray-500">No image</span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="text-sm font-medium text-gray-900 break-words">{item.product?.name || 'Product name unavailable'}</div>
                              <div className="text-xs text-gray-500 mt-1 break-words">
                                {item.product?.description ? 
                                  (item.product.description.length > 100 ? 
                                    `${item.product.description.substring(0, 100)}...` : 
                                    item.product.description) : 
                                  'No description available'}
                              </div>
                              {item.returnStatus === 'Requested' && (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                  Return Requested
                                </span>
                              )}
                              {item.returnStatus === 'Accepted' && (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Return Accepted
                                </span>
                              )}
                              {item.returnStatus === 'Rejected' && (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                  Return Rejected
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">₹{item.price}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{item.quantity}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">₹{(item.price * item.quantity).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          {item.returnStatus === 'Requested' && (
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleReturnRequest(item._id, "accept", item)}
                                className="inline-flex items-center px-3 py-1.5 border border-green-600 text-xs font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Accept & Refund
                              </button>
                              <button
                                onClick={() => handleReturnRequest(item._id, "reject", item)}
                                className="inline-flex items-center px-3 py-1.5 border border-red-600 text-xs font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Reject Return
                              </button>
                            </div>
                          )}
                          {item.returnStatus === 'Accepted' && (
                            <div className="text-green-600 flex items-center justify-end">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                              Refunded ₹{(item.price * item.quantity).toFixed(2)}
                            </div>
                          )}
                          {item.returnStatus === 'Rejected' && (
                            <div className="text-red-600 flex items-center justify-end">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                              Return Rejected
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="px-6 py-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M15 10h.01M12 10h.01M9 11h.01M12 11h.01M9 13h.01M15 13h.01M12 13h.01"></path></svg>
              Order Summary
            </h2>
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{order.itemsPrice}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">₹{order.shippingPrice}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">₹{order.taxPrice}</span>
                </div>
                <div className="flex justify-between py-3 mt-2">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-bold text-lg text-blue-700">₹{order.totalPrice}</span>
                </div>
                <div className="pt-4 mt-2 border-t border-gray-200">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>Payment Method: {order.paymentMethod || 'Cash on Delivery'}</span>
                  </div>
                  <div className="flex items-center mt-2 text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span>Payment Status: {order.isPaid ? 'Paid' : 'Not Paid'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
