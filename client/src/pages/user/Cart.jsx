import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { getCart, resetCart } from "../../features/cart/cartSlice";
import CartItem from "../../components/user/cartItem";
import axios from "axios";

const Cart = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.userAuth);
  const { cart, hasUnavailableItems, isLoading, isError, message } = useSelector((state) => state.cart);
  
  const [productOffers, setProductOffers] = useState({});
  const [categoryOffers, setCategoryOffers] = useState({});
  const [offerDiscountAmount, setOfferDiscountAmount] = useState(0);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);

  const navigate = useNavigate();

  // Function to fetch active offers for products in the cart
  const fetchProductOffers = async (cartItems) => {
    if (!cartItems || cartItems.length === 0) return;
    
    try {
      setIsLoadingOffers(true);
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
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setIsLoadingOffers(false);
    }
  };

  useEffect(() => {
    if (userInfo) {
      dispatch(getCart());
    }

    return () => {
      dispatch(resetCart());
    };
  }, [dispatch, userInfo]);
  
  // Fetch offers when cart changes
  useEffect(() => {
    if (cart && cart.items && cart.items.length > 0) {
      fetchProductOffers(cart.items);
    }
  }, [cart]);

  // Calculate cart totals
  const calculateSubtotal = () => {
    if (!cart || !cart.items || cart.items.length === 0) return 0;

    return cart.items.reduce((total, item) => {
      // Add null check for item and item.product
      if (!item || !item.product) return total;
      return total + (item.product.price * item.quantity);
    }, 0);
  };
  
  // Calculate discounted subtotal
  const calculateDiscountedSubtotal = () => {
    if (!cart || !cart.items || cart.items.length === 0) return 0;
    
    return calculateSubtotal() - (offerDiscountAmount || 0);
  };

  const subtotal = calculateSubtotal();
  const discountedSubtotal = calculateDiscountedSubtotal();
  const shipping = subtotal > 0 ? 100 : 0; // Example shipping cost
  const total = discountedSubtotal + shipping;

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
        
        {hasUnavailableItems && cart && cart.items && cart.items.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <span className="font-medium">Attention!</span> Some items in your cart are no longer available or have limited stock. Please review before checkout.
                </p>
              </div>
            </div>
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
                  
                  {offerDiscountAmount > 0 && (
                    <div className="flex justify-between border-b pb-4 text-green-600">
                      <span>Offer Discount</span>
                      <span>-₹{offerDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}

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
