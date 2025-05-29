import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getOrderDetails, clearOrder } from "../../features/order/orderSlice";
import { FaCheckCircle, FaShoppingBag, FaFileAlt } from "react-icons/fa";

const OrderSuccess = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [paymentChecked, setPaymentChecked] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const { order, isLoading } = useSelector((state) => state.order);

  useEffect(() => {
    if (id) {
      dispatch(getOrderDetails(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (order && !isLoading && !paymentChecked && retryCount < 3) {
      setPaymentChecked(true);
      const pendingPaymentId = localStorage.getItem("razorpay_payment_pending");
      const isNewOrder = new Date() - new Date(order.createdAt) < 10000;

      if (!isNewOrder && order.paymentMethod === "Razorpay" && !order.isPaid) {
        // Retry fetching the order after a delay
        setTimeout(() => {
          dispatch(getOrderDetails(id));
          setRetryCount((prev) => prev + 1);
        }, 2000);
      } else if (
        !isNewOrder &&
        order.paymentMethod === "Razorpay" &&
        !order.isPaid &&
        retryCount >= 3
      ) {
        
        navigate(`/payment-failed/${id}`);
      }
    }
  }, [order, isLoading, id, navigate, paymentChecked, retryCount, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearOrder());

    };
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <FaCheckCircle className="text-green-500 text-6xl" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your order has been received and is being
          processed.
        </p>
        {order && (
          <div className="bg-gray-50 p-4 rounded-lg mb-8">
            <h2 className="font-semibold mb-2">Order Details</h2>
            <p className="text-gray-700 mb-1">Order ID: {order.orderId}</p>
            <p className="text-gray-700 mb-1">
              Date: {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <p className="text-gray-700 mb-1">
              Payment Method: {order.paymentMethod}
              {order.isPaid ? " (Paid)" : " (Payment Pending)"}
            </p>
            <p className="text-gray-700">
              Total Amount: ₹{order.totalPrice.toFixed(2)}
            </p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to={`/orders/${id}`}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition"
          >
            <FaFileAlt /> View Order Details
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-gray-200 text-gray-800 py-3 px-6 rounded-md hover:bg-gray-300 transition"
          >
            <FaShoppingBag /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
