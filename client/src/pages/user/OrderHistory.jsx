import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyOrders,
  resetOrder,
  cancelOrder,
} from "../../features/order/orderSlice";
import {
  FaBox,
  FaShoppingBag,
  FaFileInvoice,
  FaTimesCircle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { toast } from "react-toastify";

const OrderHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const { userInfo } = useSelector((state) => state.userAuth);
  const { orders, isLoading, isError, message, pages } = useSelector(
    (state) => state.order
  );

  // Pagination – if backend supplies pages, use them; otherwise derive locally
  const itemsPerPage = 10;
  const totalPages = pages || Math.max(1, Math.ceil((orders?.length || 0) / itemsPerPage));
  const displayedOrders = pages ? orders : orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
      return;
    }

    dispatch(getMyOrders({ page: currentPage }));

    return () => {
      dispatch(resetOrder());
    };
  }, [dispatch, navigate, userInfo, currentPage]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const openCancelModal = (orderId) => {
    setSelectedOrderId(orderId);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedOrderId(null);
    setCancelReason("");
  };

  const handleCancelOrder = () => {
    if (!cancelReason) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    dispatch(
      cancelOrder({
        orderId: selectedOrderId,
        reason: cancelReason,
      })
    )
      .unwrap()
      .then(() => {
        toast.success("Order cancelled successfully");
        closeCancelModal();
        dispatch(getMyOrders({ page: currentPage }));
      })
      .catch((error) => {
        toast.error(error || "Failed to cancel order");
      });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Shipped":
        return "bg-yellow-100 text-yellow-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {isError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">
              {message || "Failed to load orders. Please try again later."}
            </p>
          </div>
        )}

        {!orders || orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FaBox className="mx-auto text-gray-400 text-5xl mb-4" />
            <h2 className="text-2xl font-medium mb-2">No Orders Found</h2>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet.
            </p>
            <Link
              to="/products"
              className="bg-black text-white py-2 px-6 rounded-md hover:bg-gray-800 inline-flex items-center"
            >
              <FaShoppingBag className="mr-2" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                 
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/orders/${order._id}`}
                          className="text-black hover:underline"
                        >
                          View Details
                        </Link>

                        {order.orderStatus === "Processing" && (
                          <button
                            onClick={() => openCancelModal(order._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        )}

                       
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {displayedOrders.length > 0 && (
              <div className="px-6 py-4 flex justify-center">
                <nav className="flex items-center">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`mx-1 px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <FaChevronLeft size={14} />
                  </button>

                  {[...Array(totalPages).keys()].map((x) => (
                    <button
                      key={x + 1}
                      onClick={() => handlePageChange(x + 1)}
                      className={`mx-1 px-3 py-1 rounded-md ${
                        x + 1 === currentPage
                          ? "bg-black text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {x + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`mx-1 px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <FaChevronRight size={14} />
                  </button>
                </nav>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Cancel Order</h2>
            <p className="text-gray-600 mb-4">
              Please provide a reason for cancellation:
            </p>

            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
            >
              <option value="">Select a reason</option>
              <option value="Changed my mind">Changed my mind</option>
              <option value="Found a better price elsewhere">
                Found a better price elsewhere
              </option>
              <option value="Ordered by mistake">Ordered by mistake</option>
              <option value="Shipping takes too long">
                Shipping takes too long
              </option>
              <option value="Other">Other</option>
            </select>

            {cancelReason === "Other" && (
              <textarea
                placeholder="Please specify your reason"
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                rows="3"
                onChange={(e) => setCancelReason(`Other: ${e.target.value}`)}
              ></textarea>
            )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={closeCancelModal}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
