import React, { useState, useEffect, useCallback, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCartItem, removeFromCart, resetCart } from "../../features/cart/cartSlice";
import { FaTag } from "react-icons/fa";
import axios from "axios";


const CartItem = memo(({ item }) => {
  const dispatch = useDispatch();
  const { isError, message, isLoading } = useSelector((state) => state.cart);
  
  const [quantityError, setQuantityError] = useState(null);
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [activeOffer, setActiveOffer] = useState(null);
  const [activeCategoryOffer, setActiveCategoryOffer] = useState(null);
  const [isLoadingOffer, setIsLoadingOffer] = useState(false);
  
  const product = item.product;
  const size = item.size;
  
  // Update local quantity when item quantity changes from server
  useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);
  
  // Fetch active offer for this product
  useEffect(() => {
    const fetchOffers = async () => {
      if (!product) {
        setActiveOffer(null);
        setActiveCategoryOffer(null);
        setIsLoadingOffer(false);
        return;
      }

      setIsLoadingOffer(true);
      try {
        try {
          const productOfferResponse = await axios.get(
            `${
              import.meta.env.VITE_API_URL || "http://localhost:5001"
            }/api/offers/product/active/${product._id}`
          );
          setActiveOffer(productOfferResponse.data);
        } catch (error) {
          // If it's a 404, just means no offers available
          if (error.response && error.response.status === 404) {
            setActiveOffer(null);
          } else {
            console.error("Error fetching product offer:", error);
          }
        }

        // Fetch category offer if product has a category
        if (product.category) {
          const categoryId =
            typeof product.category === "object"
              ? product.category._id
              : product.category;
          try {
            const categoryOfferResponse = await axios.get(
              `${
                import.meta.env.VITE_API_URL || "http://localhost:5001"
              }/api/offers/category/active/${categoryId}`
            );
            setActiveCategoryOffer(categoryOfferResponse.data);
          } catch (error) {
            // If it's a 404, just means no category offers available
            if (error.response && error.response.status === 404) {
              setActiveCategoryOffer(null);
            } else {
              console.error("Error fetching category offer:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error in fetchOffers:", error);
      } finally {
        setIsLoadingOffer(false);
      }
    };
    
    fetchOffers();
  }, [product]);
  
  const isAvailable = item.isAvailable !== false;
  const unavailableReason = item.unavailableReason;
  const stockReduced = item.stockReduced;
  
  const sizeObj = product?.sizes?.find((s) => s.size === size);
  const maxStock = sizeObj ? sizeObj.stock : 0;
  
  // Global maximum quantity limit per product
  const MAX_QUANTITY_PER_ITEM = 10;
  
  // Use the lower of maxStock and MAX_QUANTITY_PER_ITEM as the effective maximum
  const effectiveMaxQuantity = Math.min(maxStock, MAX_QUANTITY_PER_ITEM);

  const isOutOfStock = maxStock === 0;
  

  const calculateDiscountAmount = (price, offer) => {
    if (!offer) return 0;
    
    if (offer.discountType === 'percentage') {
      return price * (offer.discountValue / 100);
    } else {
      return Math.min(price, offer.discountValue); // Cap at price to avoid negative prices
    }
  };

 //for the better discountt
  const productOfferDiscount = calculateDiscountAmount(product?.price || 0, activeOffer);
  const categoryOfferDiscount = calculateDiscountAmount(product?.price || 0, activeCategoryOffer);
  
  // Select the best offer (highest discount)
  const bestOffer = productOfferDiscount >= categoryOfferDiscount ? activeOffer : activeCategoryOffer;
  // Track the source of the best offer for display purposes
  const isBestOfferFromCategory = bestOffer === activeCategoryOffer && bestOffer !== null;
  
  const calculateDiscountedPrice = () => {
    if (!bestOffer || !product) return product?.price;
    
    if (bestOffer.discountType === 'percentage') {
      const discountAmount = product.price * (bestOffer.discountValue / 100);
      return product.price - discountAmount;
    } else {
      return Math.max(0, product.price - bestOffer.discountValue);
    }
  };
  
  const discountedPrice = calculateDiscountedPrice();
  
  const formatDiscountText = () => {
    if (!bestOffer) return '';
    
    if (bestOffer.discountType === 'percentage') {
      return `${bestOffer.discountValue}% OFF`;
    } else {
      return `₹${bestOffer.discountValue} OFF`;
    }
  };
  
  useEffect(() => {
    if (!isError) {
      setQuantityError(null);
    }
  }, [isError]);



  const handleQuantityChange = useCallback((newQuantity) => {
    try {
      setQuantityError(null);
      
      if (newQuantity < 1) {
        setQuantityError('Quantity cannot be less than 1');
        return;
      }
      
      if (newQuantity > MAX_QUANTITY_PER_ITEM) {
        setQuantityError(`You can add maximum ${MAX_QUANTITY_PER_ITEM} items of the same product`);
        return;
      } else if (newQuantity > maxStock) {
        setQuantityError(`Maximum available quantity is ${maxStock}`);
        return;
      }
      
      // Optimistic update - update local state immediately
      setLocalQuantity(newQuantity);
      
      // Then dispatch the update action to sync with server
      dispatch(
        updateCartItem({
          itemId: item._id,
          quantity: newQuantity,
        })
      )
      .then(() => {
        setQuantityError(null);
      })
      .catch((error) => {
        console.error('Error updating cart item:', error);
        setLocalQuantity(item.quantity);
        
        if (error && error.errorType === 'maxQuantity') {
          setQuantityError(`Maximum available quantity is ${error.maxQuantity || maxStock}`);
        } else if (error && error.message) {
          setQuantityError(error.message);
        } else {
          setQuantityError('Could not update quantity. Please try again.');
        }
        
        setTimeout(() => {
          dispatch(resetCart());
        }, 100);
      });
      
    } catch (err) {
      console.error('Unexpected error in handleQuantityChange:', err);
      // Revert to previous quantity on error
      setLocalQuantity(item.quantity);
      setQuantityError('An unexpected error occurred. Please try again.');
      setTimeout(() => {
        dispatch(resetCart());
      }, 100);
    }
  }, [dispatch, item._id, item.quantity, maxStock, MAX_QUANTITY_PER_ITEM]);

  // Memoized remove handler to prevent unnecessary re-renders
  const handleRemove = useCallback(() => {
    dispatch(removeFromCart(item._id));
  }, [dispatch, item._id]);

  return (
    <div
      className={`border rounded-lg p-4 mb-4 ${
        !isAvailable || isOutOfStock ? "opacity-70 border-red-200" : ""
      }`}
    >
      {!isAvailable && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-3">
          <p className="text-red-700 text-sm">{unavailableReason || 'This item is no longer available'}</p>
        </div>
      )}
      
      {stockReduced && isAvailable && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mb-3">
          <p className="text-yellow-700 text-sm">Quantity reduced due to limited stock availability</p>
        </div>
      )}
      
      <div className="flex items-start">
        <div className="w-24 h-24 flex-shrink-0 mr-4 overflow-hidden rounded-md">
          {product && product.images && product.images.length > 0 ? (
            <img
              src={`http://localhost:5001${product.images[0]}`}
              alt={product?.name || 'Product'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>

        <div className="flex-grow">
          <h3 className="text-lg font-medium text-gray-800">{product?.name || 'Product no longer available'}</h3>
          <p className="text-sm text-gray-500">Size: {size}</p>
          {product && (
            <div className="mt-1">
              {bestOffer ? (
                <div>
                  <div className="flex items-center">
                    <p className="text-md font-semibold text-green-600">₹{discountedPrice ? discountedPrice.toFixed(2) : '0.00'}</p>
                    <p className="text-sm text-gray-500 line-through ml-2">₹{product.price}</p>
                  </div>
                  <div className="flex items-center mt-1 text-xs text-green-600">
                    <FaTag className="mr-1" />
                    <span>{formatDiscountText()}</span>
                    {isBestOfferFromCategory && <span className="ml-1 text-xs text-gray-500">(Category Offer)</span>}
                  </div>
                </div>
              ) : (
                <p className="text-md font-semibold">₹{product.price}</p>
              )}
            </div>
          )}

          {(!isAvailable || isOutOfStock) ? (
            <p className="text-red-500 text-sm mt-2">{isOutOfStock ? 'Out of stock' : 'Not available'}</p>
          ) : (
            <>
              <div className="flex items-center mt-2">
                <button
                  onClick={() => handleQuantityChange(localQuantity - 1)}
                  disabled={localQuantity <= 1 || !isAvailable || isLoading}
                  className="px-2 py-1 border rounded-l-md bg-gray-100 disabled:opacity-50"
                >
                  -
                </button>
                <span className="px-4 py-1 border-t border-b">
                  {localQuantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(localQuantity + 1)}
                  disabled={localQuantity >= effectiveMaxQuantity || !isAvailable || isLoading}
                  className="px-2 py-1 border rounded-r-md bg-gray-100 disabled:opacity-50"
                >
                  +
                </button>

                <span className="ml-4 text-sm text-gray-500">
                  {maxStock < MAX_QUANTITY_PER_ITEM ? `${maxStock} available` : `Max ${MAX_QUANTITY_PER_ITEM} per order`}
                </span>
              </div>
              
              {quantityError && (
                <div className="mt-2 text-sm text-red-600">
                  <p>{quantityError}</p>
                </div>
              )}
            </>
          )}

          <div className="mt-3">
            <button
              onClick={handleRemove}
              className="text-red-600 text-sm font-medium hover:text-red-800"
            >
              Remove
            </button>
          </div>
        </div>

        <div className="ml-4 text-right">
          {product && <p className="text-lg font-bold">₹{product.price * localQuantity}</p>}
        </div>
      </div>
    </div>
  );
});

export default CartItem;
