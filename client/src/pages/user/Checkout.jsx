import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { clearCart } from "../../features/cart/cartSlice";
import {
  createOrder,
  clearOrder,
  getOrderDetails,
} from "../../features/order/orderSlice";
import { getAddresses } from "../../features/userProfile/userProfileSlice";
import { FaMapMarkerAlt, FaCheck, FaTag, FaWallet } from "react-icons/fa";
import CouponApply from "../../components/user/CouponApply";
import API from "../../utils/axiosConfig";
import axios from "axios";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.userAuth);
  const {
    cart,
    hasUnavailableItems,
    isLoading: cartLoading,
  } = useSelector((state) => state.cart);
  const { addresses } = useSelector((state) => state.userProfile);
  const {
    order,
    isLoading: orderLoading,
    isSuccess,
    isError,
    message,
  } = useSelector((state) => state.order);

  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [insufficientWalletFunds, setInsufficientWalletFunds] = useState(false);

  const [itemsPrice, setItemsPrice] = useState(0);
  const [taxPrice, setTaxPrice] = useState(0);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [offerDiscountAmount, setOfferDiscountAmount] = useState(0);
  const [productOffers, setProductOffers] = useState({});
  const [categoryOffers, setCategoryOffers] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);

  // Function to fetch active offers for products in the cart
  const fetchProductOffers = async (cartItems) => {
    if (!cartItems || cartItems.length === 0) return;
    
    try {
      const productOffers = {};
      const categoryOffers = {};
      let totalOfferDiscount = 0;
      
      // Fetch offers for each product in the cart
      for (const item of cartItems) {
        if (!item.product || !item.product._id) continue;
        
        const productId = item.product._id;
        const productPrice = item.product.price * item.quantity;
        let bestDiscountForProduct = 0;
        
        // Fetch product offer
        try {
          const productOfferResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/offers/product/active/${productId}`);
          if (productOfferResponse.data) {
            productOffers[productId] = productOfferResponse.data;
            
            // Calculate product offer discount
            let productDiscountValue = 0;
            if (productOfferResponse.data.discountType === 'percentage') {
              productDiscountValue = productPrice * (productOfferResponse.data.discountValue / 100);
            } else {
              productDiscountValue = Math.min(productPrice, productOfferResponse.data.discountValue * item.quantity);
            }
            
            bestDiscountForProduct = productDiscountValue;
          }
        } catch (error) {
          // No product offer available
        }
        
        // Fetch category offer if product has a category
        if (item.product.category) {
          try {
            const categoryId = typeof item.product.category === 'object' ? item.product.category._id : item.product.category;
            const categoryOfferResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/offers/category/active/${categoryId}`);
            
            if (categoryOfferResponse.data) {
              categoryOffers[categoryId] = categoryOfferResponse.data;
              
              // Calculate category offer discount
              let categoryDiscountValue = 0;
              if (categoryOfferResponse.data.discountType === 'percentage') {
                categoryDiscountValue = productPrice * (categoryOfferResponse.data.discountValue / 100);
              } else {
                categoryDiscountValue = Math.min(productPrice, categoryOfferResponse.data.discountValue * item.quantity);
              }
              
              // Use the best discount (either product or category)
              bestDiscountForProduct = Math.max(bestDiscountForProduct, categoryDiscountValue);
            }
          } catch (error) {
            // No category offer available
          }
        }
        
        // Add the best discount for this product to the total
        totalOfferDiscount += bestDiscountForProduct;
      }
      
      setProductOffers(productOffers);
      setCategoryOffers(categoryOffers);
      setOfferDiscountAmount(totalOfferDiscount);
      return totalOfferDiscount;
    } catch (error) {
      console.error('Error fetching offers:', error);
      return 0;
    }
  };
  
  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
      return;
    }

    dispatch(getAddresses());
    return () => {};
  }, [dispatch, navigate, userInfo]);

  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(addresses[0]._id);
    }
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    if (isSuccess && order) {
      if (order.paymentMethod !== "Razorpay") {
        navigate(`/order-success/${order._id}`);
        dispatch(clearCart());
      } else if (order.isPaid) {
        navigate(`/order-success/${order._id}`);
        dispatch(clearCart());
      }
    }

    if (isError) {
      toast.error(message);
    }
  }, [isSuccess, isError, message, order, navigate, dispatch]);

  useEffect(() => {
    if (cart && cart.items && cart.items.length > 0) {
      // Fetch product offers when cart changes
      fetchProductOffers(cart.items);
      
      const itemsPriceCalc = cart.items.reduce((total, item) => {
        return total + item.product.price * item.quantity;
      }, 0);

      setItemsPrice(itemsPriceCalc);
      setTaxPrice(Math.round(itemsPriceCalc * 0.18));
      setShippingPrice(itemsPriceCalc > 1000 ? 0 : 100);

      const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
      setDiscountAmount(discount);
    }
  }, [cart, appliedCoupon]);

  // Separate useEffect to calculate total price after offer discounts are fetched
  useEffect(() => {
    if (itemsPrice > 0) {
      setTotalPrice(
        itemsPrice +
          taxPrice +
          shippingPrice -
          discountAmount -
          offerDiscountAmount
      );
    }
  }, [itemsPrice, taxPrice, shippingPrice, discountAmount, offerDiscountAmount]);

  // Fetch user wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/profile/wallet`,
          config
        );
        setWalletBalance(response.data.walletBalance);
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      }
    };

    if (userInfo && userInfo.token) {
      fetchWalletBalance();
    }
  }, [userInfo]);

  // Check if wallet has sufficient funds
  useEffect(() => {
    if (paymentMethod === "Wallet") {
      setInsufficientWalletFunds(walletBalance < totalPrice);
    } else {
      setInsufficientWalletFunds(false);
    }
  }, [paymentMethod, walletBalance, totalPrice]);

  const loadRazorpayScript = useCallback(() => {
    return new Promise((resolve) => {
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

  const initializeRazorpayPayment = useCallback(
    async (orderId) => {
      try {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error("Failed to load payment gateway. Please try again.");
          localStorage.removeItem("razorpay_payment_pending");
          return;
        }

        const keyResponse = await API.get("/api/payments/razorpay-key");
        const keyId = keyResponse.data.key_id;

        const orderResponse = await API.post("/api/payments/create-order", {
          amount: totalPrice,
          currency: "INR",
          receipt: `order_rcpt_${orderId.substring(0, 8)}`,
          notes: {
            orderId: orderId,
            userId: userInfo._id,
          },
        });

        if (!orderResponse.data.success || !orderResponse.data.order) {
          toast.error("Failed to create payment order. Please try again.");
          localStorage.removeItem("razorpay_payment_pending");
          return;
        }

        const razorpayOrder = orderResponse.data.order;

        const options = {
          key: keyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "Zekoya",
          description: "Payment for your order",
          order_id: razorpayOrder.id,
          handler: async (response) => {
            try {
              const verifyResponse = await API.post(
                "/api/payments/verify-payment",
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: orderId,
                }
              );

              if (verifyResponse.data.success) {
                await dispatch(getOrderDetails(orderId));
                dispatch(clearCart()); // Clear cart only after successful payment
                localStorage.removeItem("razorpay_payment_pending");
                navigate(`/order-success/${orderId}`); // Navigate to success page
              } else {
                throw new Error("Payment verification failed");
              }
            } catch (error) {
              console.error("Payment verification failed:", error);
              localStorage.removeItem("razorpay_payment_pending");
              navigate(`/payment-failed/${orderId}`);
            }
          },
          prefill: {
            name: userInfo?.name || "",
            email: userInfo?.email || "",
            contact: userInfo?.phone || "",
          },
          theme: {
            color: "#3399cc",
          },
          modal: {
            ondismiss: function () {
              console.log("Payment modal dismissed");
              localStorage.removeItem("razorpay_payment_pending");
              navigate(`/payment-failed/${orderId}`);
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (error) {
        console.error("Error initializing Razorpay payment:", error);
        localStorage.removeItem("razorpay_payment_pending");
        toast.error("Failed to initialize payment. Please try again.");
      }
    },
    [dispatch, navigate, totalPrice, userInfo, loadRazorpayScript]
  );

  const handleCouponApplied = (couponData) => {
    setAppliedCoupon(couponData);
  };

  const placeOrderHandler = async () => {
    if (hasUnavailableItems) {
      toast.error("Please remove unavailable items from your cart");
      return;
    }

    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }

    if (paymentMethod === "Wallet" && insufficientWalletFunds) {
      toast.error("Insufficient wallet balance for this order");
      return;
    }

    const orderData = {
      addressId: selectedAddressId,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountPrice: discountAmount,
      offerDiscountPrice: offerDiscountAmount,
      totalPrice,
      productOffers,
    };

    if (appliedCoupon) {
      orderData.couponCode = appliedCoupon.code;
      orderData.couponDiscount = appliedCoupon.discountAmount;
    }

    dispatch(createOrder(orderData))
      .unwrap()
      .then((result) => {
        setCreatedOrderId(result._id);
        if (paymentMethod === "Razorpay") {
          initializeRazorpayPayment(result._id);
        } else {
          navigate(`/order-success/${result._id}`);
        }
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const hasUnavailableItemsInCart =
    hasUnavailableItems &&
    cart &&
    cart.items &&
    cart.items.some((item) => !item.isAvailable);

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

        {hasUnavailableItemsInCart && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  width="20"
                  height="20"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <span className="font-medium">
                    Cannot proceed with checkout!
                  </span>{" "}
                  Some items in your cart are no longer available. Please return
                  to your cart and remove these items before continuing.
                </p>
                <p className="mt-2">
                  <button
                    onClick={() => navigate("/cart")}
                    className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-200"
                  >
                    Return to Cart
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {hasUnavailableItems && !hasUnavailableItemsInCart && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  width="20"
                  height="20"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <span className="font-medium">Note:</span> Some items in your
                  cart had their quantities adjusted due to limited stock
                  availability.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
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
                        src={`http://localhost:5001${item.product.images[0]}`}
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
                      {(productOffers[item.product._id] || categoryOffers[item.product.category]) && (
                        <div className="flex items-center mt-1 text-xs text-green-600">
                          <FaTag className="mr-1" />
                          <span>
                            {(productOffers[item.product._id] || categoryOffers[item.product.category]).discountType === 'percentage' 
                              ? `${(productOffers[item.product._id] || categoryOffers[item.product.category]).discountValue}% off` 
                              : `₹${(productOffers[item.product._id] || categoryOffers[item.product.category]).discountValue} off`}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {(productOffers[item.product._id] || categoryOffers[item.product.category]) ? (
                        <>
                          <p className="font-medium text-green-600">
                            {(productOffers[item.product._id] || categoryOffers[item.product.category]).discountType === 'percentage' 
                              ? `₹${(item.product.price * item.quantity * (1 - (productOffers[item.product._id] || categoryOffers[item.product.category]).discountValue / 100)).toFixed(2)}` 
                              : `₹${(item.product.price * item.quantity - Math.min((productOffers[item.product._id] || categoryOffers[item.product.category]).discountValue * item.quantity, item.product.price * item.quantity)).toFixed(2)}`}
                          </p>
                          <p className="text-xs text-gray-500 line-through">
                            ₹{(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </>
                      ) : (
                        <p className="font-medium">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              {addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className={`border rounded-lg p-4 mb-3 ${
                        selectedAddressId === address._id
                          ? "border-black"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{address.name}</h3>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/profile/addresses/edit/${address._id}?returnUrl=/checkout`
                              );
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          {selectedAddressId === address._id && (
                            <FaCheck className="text-green-500" />
                          )}
                        </div>
                      </div>
                      <div
                        className="mt-2 text-sm text-gray-600 cursor-pointer"
                        onClick={() => setSelectedAddressId(address._id)}
                      >
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
                    onClick={() =>
                      navigate("/profile/addresses/add?returnUrl=/checkout")
                    }
                    className="bg-black text-white py-2 px-6 rounded-md hover:bg-gray-800"
                  >
                    Add New Address
                  </button>
                </div>
              )}
              {addresses.length > 0 && (
                <div className="text-right">
                  <button
                    onClick={() =>
                      navigate("/profile/addresses/add?returnUrl=/checkout")
                    }
                    className="text-black underline"
                  >
                    Add New Address
                  </button>
                </div>
              )}
            </div>
          </div>
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
                {offerDiscountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Offer Discount</span>
                    <span>-₹{offerDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                <CouponApply
                  orderTotal={itemsPrice - offerDiscountAmount}
                  onCouponApplied={handleCouponApplied}
                />
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="font-medium mb-2">Payment Method</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash on Delivery"
                      checked={paymentMethod === "Cash on Delivery"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="form-radio"
                    />
                    <span>Cash on Delivery</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Razorpay"
                      checked={paymentMethod === "Razorpay"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="form-radio"
                    />
                    <span>Pay Online (Razorpay)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Wallet"
                      checked={paymentMethod === "Wallet"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="form-radio"
                    />
                    <span className="flex items-center">
                      <FaWallet className="mr-1 text-blue-600" /> Wallet
                    </span>
                  </label>
                  
                  {paymentMethod === "Wallet" && (
                    <div className="mt-2 pl-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Available Balance:</span>
                          <span className="font-medium text-blue-700">₹{walletBalance.toFixed(2)}</span>
                        </div>
                        
                        {insufficientWalletFunds && (
                          <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                            <p>Insufficient wallet balance for this order.</p>
                            <p>Order Total: ₹{totalPrice.toFixed(2)}</p>
                            <p>Missing: ₹{(totalPrice - walletBalance).toFixed(2)}</p>
                          </div>
                        )}
                        
                        {!insufficientWalletFunds && walletBalance >= totalPrice && (
                          <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200">
                            <p>Your wallet has sufficient balance for this order.</p>
                            <p>Remaining after purchase: ₹{(walletBalance - totalPrice).toFixed(2)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={placeOrderHandler}
                disabled={orderLoading || (paymentMethod === "Wallet" && insufficientWalletFunds)}
                className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
