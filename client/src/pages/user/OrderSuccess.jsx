import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getOrderDetails, resetOrder } from "../../features/order/orderSlice";
import { FaCheckCircle, FaBox, FaShoppingBag } from "react-icons/fa";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.userAuth);
  const { order, isLoading, isError } = useSelector((state) => state.order);

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
      return;
    }

    if (orderId) {
      dispatch(getOrderDetails(orderId));
    }

    return () => {
      dispatch(resetOrder());
    };
  }, [dispatch, navigate, orderId, userInfo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              We couldn't find your order. Please try again or contact customer
              support.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-black text-white py-2 px-6 rounded-md hover:bg-gray-800"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
          <FaCheckCircle className="mx-auto text-green-500 text-6xl mb-6" />

          <h1 className="text-3xl font-bold mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order. We'll send you a confirmation email
            shortly.
          </p>

          <div className="bg-gray-50 p-4 rounded-md mb-8">
            <p className="font-medium">Order ID: {order.orderId}</p>
            <p className="text-sm text-gray-600">
              Please keep this ID for future reference
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              to={`/orders/${order._id}`}
              className="bg-black text-white py-3 px-6 rounded-md hover:bg-gray-800 flex items-center justify-center gap-2"
            >
              <FaBox />
              <span>View Order</span>
            </Link>

            <Link
              to="/products"
              className="border border-black text-black py-3 px-6 rounded-md hover:bg-gray-100 flex items-center justify-center gap-2"
            >
              <FaShoppingBag />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
