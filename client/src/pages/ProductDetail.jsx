import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaStar, FaShoppingCart, FaHeart } from "react-icons/fa";
import { addToCart } from "../features/cart/cartSlice";
import { toast } from "react-toastify";
import { getProductById } from "../features/products/productSlice";
import {
  addToWishlist,
  removeFromWishlist,
} from "../features/wishlist/wishlistSlice";
import {
  getActiveOfferForProduct,
  getActiveOfferForCategory,
} from "../features/offers/offerSlice";
import ImageZoom from "../components/ImageZoom";
import ProductOffer from "../components/ProductOffer";
import CategoryOffer from "../components/CategoryOffer";
import DiscountedPrice from "../components/DiscountedPrice";

const ProductDetail = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const { product, isLoading, isError } = useSelector(
    (state) => state.products
  );
  const { userInfo } = useSelector((state) => state.userAuth);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { activeOffer, activeCategoryOffer } = useSelector(
    (state) => state.offer
  );

  // Function to calculate discount amount for comparison
  const calculateDiscountAmount = (price, offer) => {
    if (!offer) return 0;
    
    if (offer.discountType === "percentage") {
      return price * (offer.discountValue / 100);
    } else {
      return Math.min(price, offer.discountValue); // Cap at price to avoid negative prices
    }
  };

  // Determine which offer gives the best discount
  const productOfferDiscount = calculateDiscountAmount(product?.price || 0, activeOffer);
  const categoryOfferDiscount = calculateDiscountAmount(product?.price || 0, activeCategoryOffer);
  
  // Select the best offer (highest discount)
  const bestOffer = productOfferDiscount >= categoryOfferDiscount ? activeOffer : activeCategoryOffer;
  // Track the source of the best offer for display purposes
  const isBestOfferFromCategory = bestOffer === activeCategoryOffer;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, _setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    if (productId) {
      dispatch(getProductById(productId));
      // Fetch active offer for this product
      dispatch(getActiveOfferForProduct(productId));
    }
  }, [dispatch, productId]);

  // Fetch category offer when product data is available
  useEffect(() => {
    if (product && product.category && typeof product.category === "object") {
      dispatch(getActiveOfferForCategory(product.category._id));
    } else if (product && product.category) {
      dispatch(getActiveOfferForCategory(product.category));
    }
  }, [dispatch, product]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium text-gray-700">
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-800 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/products"
            className="inline-block bg-black text-white px-6 py-2"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.totalStock <= 0;

  const displayCategory =
    typeof product.category === "object" && product.category !== null
      ? product.category.name
      : product.category;

  const productDescription =
    product.description ||
    `Carve a new lane for yourself with the ${product.name}—your go-to for complexity, depth and easy styling. The richly layered design includes premium materials and accents that come together to make one of the coolest products of the season.`;

  const isInWishlist =
    wishlist &&
    wishlist.products &&
    wishlist.products.some((item) => item._id === product._id);

  const getAvailableStock = () => {
    if (!product.sizes || !selectedSize) return 0;
    const sizeObj = product.sizes.find((s) => s.size === selectedSize);
    return sizeObj ? sizeObj.stock : 0;
  };

  const availableStock = getAvailableStock();

  const handleAddToCart = () => {
    if (!userInfo) {
      toast.error("Please login to add to cart");
      window.location.href = "/login";
      return;
    }

    if (!selectedSize) {
      toast.error("Please select a size!");
      setSizeError(true);
      // Scroll to size selection
      const sizeSection = document.getElementById("size-selection");
      if (sizeSection) {
        sizeSection.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    if (availableStock <= 0) {
      toast.error("Selected size is out of stock");
      return;
    }

    // Send data in the format expected by the backend
    const productToAdd = {
      productId: product._id,
      size: selectedSize,
      quantity: quantity,
    };

    dispatch(addToCart(productToAdd))
      .unwrap()
      .then(() => {
        toast.success(`${product.name} added to cart!`);
      })
      .catch((error) => {
        if (error && error.message) {
          toast.error(error.message);
        } else {
          toast.error("Failed to add product to cart");
        }
      });
  };

  const handleWishlistToggle = () => {
    if (!userInfo) {
      toast.error("Please login to add to wishlist");
      window.location.href = "/login";
      return;
    }

    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
      toast.success(`${product.name} removed from wishlist`);
    } else {
      dispatch(addToWishlist(product));
      toast.success(`${product.name} added to wishlist`);
    }
  };

  const mainImageUrl = product.images && product.images.length > 0 && product.images[selectedImage] 
    ? product.images[selectedImage].url 
    : "/placeholder-image.jpg"; // Fallback image

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Product Images */}
          <div className="w-full lg:w-2/3">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Thumbnail Column */}
              {product.images && product.images.length > 1 && (
                <div className="flex md:flex-col gap-2 order-2 md:order-1">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      className={`border ${
                        selectedImage === index
                          ? "border-black"
                          : "border-gray-200"
                      } cursor-pointer w-16 h-16`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={image.url}
                        alt={`${product.name} - View ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Main Image with Zoom */}
              <div className="flex-1 order-1 md:order-2">
                <div className="product-image-container" style={{ border: '1px solid #f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <ImageZoom 
                    src={mainImageUrl}
                    alt={product.name}
                    zoomScale={2.5}
                    height="400px"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="w-full lg:w-1/3">
            <h1 className="text-3xl font-medium text-gray-900 mb-1">
              {product.name}
            </h1>
            <p className="text-xl text-gray-600 mb-4">{displayCategory}</p>

            {/* Best Offer Banner - Show the offer with the highest discount */}
            {bestOffer && (
              isBestOfferFromCategory ? (
                <CategoryOffer offer={bestOffer} />
              ) : (
                <ProductOffer offer={bestOffer} />
              )
            )}

            {/* Product Price */}
            <div className="mb-6">
              {bestOffer ? (
                <DiscountedPrice
                  originalPrice={product.price}
                  offer={bestOffer}
                />
              ) : (
                <div>
                  <span className="text-xl font-medium text-gray-900">
                    MRP: ₹{product.price.toFixed(2)}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    Inclusive of all taxes
                  </p>
                  <p className="text-sm text-gray-500">
                    (Also includes all applicable duties)
                  </p>
                </div>
              )}
            </div>

            {/* Add to Cart Button */}
            <div className="mb-6">
              {isOutOfStock ? (
                <p>This product is currently unavailable</p>
              ) : (
                <div>
                  <button
                    onClick={handleAddToCart}
                    className={`w-full py-4 px-6 mb-2 transition-colors ${
                      !selectedSize
                        ? "bg-gray-700 text-white hover:bg-gray-800"
                        : availableStock === 0
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    Add to Cart
                  </button>
                  {!selectedSize && (
                    <p className="text-amber-600 text-sm mb-4 text-center">
                      Please select a size before adding to cart
                    </p>
                  )}
                  <button
                    onClick={handleWishlistToggle}
                    className="w-full border border-gray-300 py-4 px-6 flex items-center justify-center gap-2 hover:border-gray-400 transition-colors"
                  >
                    {isInWishlist ? (
                      <>
                        <FaHeart className="text-red-500" />
                        <span>Remove from Wishlist</span>
                      </>
                    ) : (
                      <>
                        <FaHeart className="text-gray-400" />
                        <span>Add to Wishlist</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="prose max-w-none mb-8">
              <p className="mb-6">{productDescription}</p>

              <ul className="list-disc pl-5 space-y-2">
                {product.color && (
                  <li>
                    <strong>Colour Shown:</strong> {product.color}
                  </li>
                )}
                {product.style && (
                  <li>
                    <strong>Style:</strong> {product.style}
                  </li>
                )}
                {product.origin && (
                  <li>
                    <strong>Country/Region of Origin:</strong> {product.origin}
                  </li>
                )}
              </ul>
            </div>

            {/* Sizes Section */}
            {!isOutOfStock && product.sizes && product.sizes.length > 0 && (
              <div id="size-selection" className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Select Size</h3>
                  {sizeError && (
                    <p className="text-red-500 text-sm font-medium">
                      Please select a size
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {product.sizes.map((size, index) => {
                    const sizeObj =
                      typeof size === "object" ? size : { size, stock: 0 };
                    const sizeValue = sizeObj.size;
                    const sizeStock =
                      typeof sizeObj.stock === "number" ? sizeObj.stock : 0;
                    const isAvailable = sizeStock > 0;

                    return (
                      <button
                        key={index}
                        className={`border ${
                          selectedSize === sizeValue
                            ? "border-black bg-gray-100"
                            : isAvailable
                            ? "border-gray-300 hover:border-black"
                            : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                        } py-3 relative`}
                        onClick={() =>
                          isAvailable && setSelectedSize(sizeValue)
                        }
                        disabled={!isAvailable}
                      >
                        {sizeValue}
                        {!isAvailable && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60">
                            <span className="text-xs text-gray-500">
                              Out of stock
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {sizeError && (
                  <p className="text-red-500 text-sm mt-2">
                    Please select an available size before adding to cart
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
