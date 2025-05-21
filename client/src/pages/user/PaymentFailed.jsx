import React, { useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getOrderDetails, clearOrder } from "../../features/order/orderSlice";
import {
  FaTimesCircle,
  FaShoppingBag,
  FaFileAlt,
  FaRedo,
  FaArrowLeft
} from "react-icons/fa";
import API from "../../utils/axiosConfig";
import { toast } from "react-toastify";

const PaymentFailed = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { order, isLoading } = useSelector((state) => state.order);

  useEffect(() => {
    if (id) {
      dispatch(getOrderDetails(id));
    }
  }, [dispatch, id]);

  // Cleanup effect - clear order state when component unmounts
  useEffect(() => {
    return () => {
      // Clear order state when component unmounts
      dispatch(clearOrder());
      console.log("PaymentFailed component unmounted, clearing order state");
    };
  }, [dispatch]);

  // Load Razorpay script
  const loadRazorpayScript = useCallback(() => {
    return new Promise((resolve) => {
      // Check if script already exists
      if (
        document.querySelector(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        )
      ) {
        console.log("Razorpay script already loaded");
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        console.log("Razorpay script loaded successfully");
        resolve(true);
      };
      script.onerror = () => {
        console.error("Failed to load Razorpay script");
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }, []);

  // Handle retry payment
  const handleRetryPayment = async () => {
    if (!order || !id) {
      toast.error("Order information not available");
      return;
    }

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway. Please try again.");
        return;
      }

      // Get Razorpay key
      const keyResponse = await API.get("/api/payments/razorpay-key");
      const keyId = keyResponse.data.key_id;

      // Create Razorpay order
      const orderResponse = await API.post("/api/payments/create-order", {
        amount: order.totalPrice,
        currency: "INR",
        receipt: `order_rcpt_${id.substring(0, 8)}`,
        notes: {
          orderId: id,
          userId: order.user,
        },
      });

      if (!orderResponse.data.success || !orderResponse.data.order) {
        toast.error("Failed to create payment order. Please try again.");
        return;
      }

      const razorpayOrder = orderResponse.data.order;

      // Open Razorpay payment form
      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Zekoya",
        description: "Payment for your order",
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            // Verify payment
            await API.post("/api/payments/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: id,
            });

            // Navigate to success page after successful payment
            toast.success("Payment successful!");
            navigate(`/order-success/${id}`);
          } catch (error) {
            console.error("Payment verification failed:", error);
            toast.error("Payment verification failed. Please try again.");
          }
        },
        prefill: {
          name: order.shippingAddress?.name || "",
          email: "", // We don't have this in the order
          contact: order.shippingAddress?.phone || "",
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: function () {
            console.log("Payment modal dismissed");
            toast.info("Payment cancelled. You can try again later.");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error initializing Razorpay payment:", error);
      toast.error("Failed to initialize payment. Please try again.");
    }
  };

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
          <FaTimesCircle className="text-red-500 text-6xl" />
        </div>

        <h1 className="text-3xl font-bold mb-4">Payment Failed</h1>

        <p className="text-gray-600 mb-8">
          We're sorry, but your payment could not be processed. Your order has
          been saved, and you can try again or choose a different payment
          method.
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
          <button
            onClick={handleRetryPayment}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition"
          >
            <FaRedo /> Retry Payment
          </button>

          <Link
            to="/checkout"
            className="flex items-center justify-center gap-2 bg-orange-500 text-white py-3 px-6 rounded-md hover:bg-orange-600 transition"
          >
            <FaArrowLeft /> Back to Checkout
          </Link>

          <Link
            to={`/orders/${id}`}
            className="flex items-center justify-center gap-2 bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 transition"
          >
            <FaFileAlt /> View Order Details
          </Link>

          <Link
            to="/shop"
            className="flex items-center justify-center gap-2 bg-gray-200 text-gray-800 py-3 px-6 rounded-md hover:bg-gray-300 transition"
          >
            <FaShoppingBag /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
