import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';
import { toast } from 'react-toastify';

const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const base = import.meta.env.VITE_API_URL.replace(/\/$/, '');
  const path = imagePath.replace(/^\/+/, '');
  return `${base}/${path}`;
};

const ProductCard = ({ product }) => {
  const {
    _id,
    name,
    price,
    images,
    brand,
    category,
    sizes,
    totalStock,
    isFeatured,
  } = product;

  const mainImage = images && images.length > 0 ? images[0] : '';
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);

  let displayBrand = brand;
  if (typeof displayBrand === 'object' && displayBrand !== null) {
    displayBrand = displayBrand.name || JSON.stringify(displayBrand);
  }
  let displayCategory = category;
  if (typeof displayCategory === 'object' && displayCategory !== null) {
    displayCategory = displayCategory.name || JSON.stringify(displayCategory);
  }

  const handleAddToCart = (e) => {
    e.preventDefault(); 
    e.stopPropagation();
    toast.success(`${name} added to cart!`);
  };

  const handleAddToFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.info("Added to favorites!");
  };

  const isOutOfStock = totalStock <= 0;

  return (
    <Link to={`/products/${_id}`} className="flex flex-col h-full group">
      <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
        <img
          src={getImageUrl(mainImage)}
          alt={name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      
    
      </div>

      <div className="mt-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{displayCategory}</p>
          </div>
          <span className="font-medium">{formattedPrice}</span>
        </div>
        
        <div className="mt-auto pt-4 flex justify-end space-x-2">
          <button 
            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors border border-gray-200 z-10"
            onClick={handleAddToFavorite}
          >
            <FaHeart className="w-4 h-4 text-red-500" />
          </button>
          <button 
            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors border border-gray-200 z-10"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            <FaShoppingCart className="w-4 h-4 text-blue-500" />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;