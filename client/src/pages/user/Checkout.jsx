import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getCart, clearCart } from "../../features/cart/cartSlice";
import { createOrder, resetOrder } from "../../features/order/orderSlice";
import { FaMapMarkerAlt, FaCheck } from "react-icons/fa";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.userAuth);
  const { cart, isLoading: cartLoading } = useSelector((state) => state.cart);
  const {
    order,
    isLoading: orderLoading,
    isSuccess,
    isError,
    message,
  } = useSelector((state) => state.order);

  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addresses, setAddresses] = useState([]);

  // Calculate prices
  const [itemsPrice, setItemsPrice] = useState(0);
  const [taxPrice, setTaxPrice] = useState(0);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
      return;
    }

    dispatch(getCart());
    fetchAddresses();

    return () => {
      dispatch(resetOrder());
    };
  }, [dispatch, navigate, userInfo]);

  useEffect(() => {
    if (isSuccess && order) {
      navigate(`/order-success/${order._id}`);
      dispatch(clearCart());
    }

    if (isError) {
      toast.error(message);
    }
  }, [isSuccess, isError, message, order, navigate, dispatch]);

  useEffect(() => {
    if (cart && cart.items && cart.items.length > 0) {
      // Calculate prices
      const itemsPriceCalc = cart.items.reduce((total, item) => {
        return total + item.product.price * item.quantity;
      }, 0);

      setItemsPrice(itemsPriceCalc);
      setTaxPrice(Math.round(itemsPriceCalc * 0.18)); // 18% GST
      setShippingPrice(itemsPriceCalc > 1000 ? 0 : 100); // Free shipping over ₹1000
      setTotalPrice(
        itemsPriceCalc +
          Math.round(itemsPriceCalc * 0.18) +
          (itemsPriceCalc > 1000 ? 0 : 100)
      );
    }
  }, [cart]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/users/profile/addresses", {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch addresses");
      }

      const addresses = await response.json();

      if (addresses && addresses.length > 0) {
        setAddresses(addresses);

        // Set default address if available
        const defaultAddress = addresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id);
        } else {
          setSelectedAddressId(addresses[0]._id);
        }
      }
    } catch (error) {
      toast.error("Failed to load addresses");
      console.error(error);
    }
  };

  const placeOrderHandler = () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }

    dispatch(
      createOrder({
        addressId: selectedAddressId,
        paymentMethod: "Cash on Delivery",
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      })
    );
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">
              Add some products to your cart before checking out.
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items & Address */}
          <div className="lg:col-span-2">
            {/* Cart Items */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="divide-y">
                {cart.items.map((item) => (
                  <div
                    key={`${item.product._id}-${item.size}`}
                    className="py-4 flex items-start"
                  >
                    <div className="w-16 h-16 flex-shrink-0 mr-4 overflow-hidden rounded-md">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-grow">
                      <h3 className="text-base font-medium">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-500">Size: {item.size}</p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-medium">
                        ₹{item.product.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>

              {addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className={`border rounded-lg p-4 cursor-pointer hover:border-black transition-colors ${
                        selectedAddressId === address._id.toString()
                          ? "border-black bg-gray-50"
                          : "border-gray-200"
                      }`}
                      onClick={() =>
                        setSelectedAddressId(address._id.toString())
                      }
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{address.name}</p>
                          <p className="text-sm text-gray-600">
                            {address.phone}
                          </p>
                        </div>
                        {selectedAddressId === address._id.toString() && (
                          <FaCheck className="text-green-500" />
                        )}
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>{address.addressLine1}</p>
                        {address.addressLine2 && <p>{address.addressLine2}</p>}
                        <p>
                          {address.city}, {address.state} {address.postalCode}
                        </p>
                        <p>{address.country}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaMapMarkerAlt className="mx-auto text-gray-400 text-4xl mb-4" />
                  <p className="text-gray-600 mb-4">
                    No addresses found. Please add an address to continue.
                  </p>
                  <button
                    onClick={() => navigate("/profile/addresses/add")}
                    className="bg-black text-white py-2 px-6 rounded-md hover:bg-gray-800"
                  >
                    Add New Address
                  </button>
                </div>
              )}

              {addresses.length > 0 && (
                <div className="text-right">
                  <button
                    onClick={() => navigate("/profile/addresses/add")}
                    className="text-black underline"
                  >
                    Add New Address
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (18% GST)</span>
                  <span>₹{taxPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>
                    {shippingPrice > 0
                      ? `₹${shippingPrice.toFixed(2)}`
                      : "Free"}
                  </span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Payment Method</h3>
                <div className="border rounded-md p-3 bg-gray-50">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={true}
                      readOnly
                      className="mr-2"
                    />
                    <span>Cash on Delivery</span>
                  </label>
                </div>
              </div>

              <button
                onClick={placeOrderHandler}
                disabled={!selectedAddressId || orderLoading}
                className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {orderLoading ? "Processing..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
