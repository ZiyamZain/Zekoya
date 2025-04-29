import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaStar, FaShoppingCart, FaHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getProductById } from '../features/products/productSlice';

const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;

  const base = import.meta.env.VITE_API_URL.replace(/\/$/, '');
  const path = imagePath.replace(/^\/+/, '');
  return `${base}/${path}`;
};

const ProductDetail = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const { product, isLoading, isError } = useSelector((state) => state.products);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (productId) {
      dispatch(getProductById(productId));
    }
  }, [dispatch, productId]);

  const handleAddToCart = () => {
    toast.success(`${product?.name} added to cart!`);
  };

  const handleAddToFavorites = () => {
    toast.info(`${product?.name} added to favorites!`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading product...</p>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/products" className="inline-block bg-black text-white px-6 py-2">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }


  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(product.price);


  const isOutOfStock = product.totalStock <= 0;


  const displayCategory = 
    typeof product.category === 'object' && product.category !== null
      ? product.category.name
      : product.category;


  const productDescription = product.description || 
    `Carve a new lane for yourself with the ${product.name}—your go-to for complexity, depth and easy styling. The richly layered design includes premium materials and accents that come together to make one of the coolest products of the season.`;

  return (
    <div className="min-h-screen bg-white">
  
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center text-sm text-gray-500">
          <Link to="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:underline">Products</Link>
          <span className="mx-2">/</span>
          <Link 
            to={`/products/category/${encodeURIComponent(displayCategory)}`} 
            className="hover:underline"
          >
            {displayCategory}
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-black">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="w-full lg:w-2/3">
            <div className="flex flex-col md:flex-row gap-4">
           
              <div className="flex md:flex-col gap-2 order-2 md:order-1">
                {product.images && product.images.map((image, index) => (
                  <button 
                    key={index}
                    className={`border-2 ${selectedImage === index ? 'border-black' : 'border-gray-200'} p-1 w-16 h-16`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img 
                      src={getImageUrl(image)} 
                      alt={`${product.name} thumbnail ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

     
              <div className="flex-1 bg-gray-100 order-1 md:order-2">
                <img
                  src={getImageUrl(product.images?.[selectedImage] || '')}
                  alt={product.name}
                  className="w-full h-auto object-contain"
                />
                <div className="mt-2 flex items-center">
                  <FaStar className="text-yellow-500 mr-1" />
                  <span className="font-medium">Highly Rated</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="w-full lg:w-1/3">
            <h1 className="text-3xl font-medium text-gray-900 mb-1">{product.name}</h1>
            <p className="text-xl text-gray-600 mb-4">{displayCategory}</p>
            
            <div className="mb-6">
              <p className="text-xl font-medium">MRP : {formattedPrice}</p>
              <p className="text-sm text-gray-500">Inclusive of all taxes</p>
              <p className="text-sm text-gray-500">(Also includes all applicable duties)</p>
            </div>

            {isOutOfStock ? (
              <div className="bg-gray-100 p-4 mb-6">
                <p className="font-medium">Sold Out:</p>
                <p>This product is currently unavailable</p>
              </div>
            ) : (
              <div className="mb-6">
                <button 
                  onClick={handleAddToCart}
                  className="w-full bg-black text-white py-4 px-6 mb-4 hover:bg-gray-800 transition-colors"
                >
                  Add to Cart
                </button>
                <button 
                  onClick={handleAddToFavorites}
                  className="w-full border border-gray-300 py-4 px-6 flex items-center justify-center gap-2 hover:border-gray-400 transition-colors"
                >
                  <FaHeart />
                  <span>Favorite</span>
                </button>
              </div>
            )}

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
              <div className="mb-8">
                <h3 className="font-medium mb-2">Select Size</h3>
                <div className="grid grid-cols-3 gap-2">
                  {product.sizes.map((size, index) => {
                    const sizeValue = typeof size === 'object' ? size.size : size;
                    return (
                      <button 
                        key={index} 
                        className="border border-gray-300 py-3 hover:border-black"
                      >
                        {sizeValue}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
