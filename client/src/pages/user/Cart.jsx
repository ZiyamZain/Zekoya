import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { getCart, resetCart } from "../../features/cart/cartSlice";
import CartItem from "../../components/user/cartItem";

const Cart = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.userAuth);
  const { cart, isLoading, isError, message } = useSelector((state) => state.cart  );

  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo) {
      dispatch(getCart());
    }

    return () => {
      dispatch(resetCart());
    };
  }, [dispatch, userInfo]);

  // Calculate cart totals
  const calculateSubtotal = () => {
    if (!cart || !cart.items || cart.items.length === 0) return 0;

    return cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 0 ? 100 : 0; // Example shipping cost
  const total = subtotal + shipping;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        {isError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{message}</p>
          </div>
        )}

        {!cart || !cart.items || cart.items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link
              to="/products"
              className="inline-block bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Cart Items ({cart.items.length})
                </h2>

                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <CartItem key={item._id} item={item} />
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-4">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between border-b pb-4">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">₹{shipping.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-bold">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>

                  <button className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition mt-6"
                  onClick={()=> navigate('/checkout')}
                  disabled={cart.items.length ===0 }
                  >
                    Proceed to Checkout
                  </button>

                  <div className="text-center mt-4">
                    <Link
                      to="/products"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
