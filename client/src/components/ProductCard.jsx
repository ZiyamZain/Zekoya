import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {useDispatch , useSelector} from "react-redux";
import { addToWishlist,removeFromWishlist} from "../features/wishlist/wishlistSlice";
import ProductCardOffer from './ProductCardOffer';
import { getImageUrl } from '../utils/imageUtils';
import { offerAxios } from '../utils/userAxiosConfig'; // Adjusted path assuming utils is one level up from components

const ProductCard = ({ product }) => {
  const {
    _id,
    name,
    price,
    images,
    brand,
    category,
  } = product;
  
  const [activeOffer, setActiveOffer] = useState(null);
  
  // Fetch active offer for this product
  useEffect(() => {
    const fetchOffer = async () => {
      if (!_id) return;
      
      try {
        const response = await offerAxios.get(`/product/active/${_id}`);
        if (response.data) {
          setActiveOffer(response.data);
        }
      } catch {
        // Silently fail - no offer available is a normal state
        // Don't log errors for 404s as they're expected when no offer exists
      } finally {
        // No longer setting isLoadingOffer
      }
    };
    
    fetchOffer();
  }, [_id]);

  const mainImage = images && images.length > 0 ? images[0] : '';
  
  // Calculate discounted price if there's an active offer
  const calculateDiscountedPrice = () => {
    if (!activeOffer) return price;
    
    if (activeOffer.discountType === 'percentage') {
      const discountAmount = price * (activeOffer.discountValue / 100);
      return price - discountAmount;
    } else {
      return Math.max(0, price - activeOffer.discountValue);
    }
  };
  
  const discountedPrice = calculateDiscountedPrice();
  
  const formattedOriginalPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
  
  const formattedDiscountedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(discountedPrice);

  let displayBrand = brand;
  if (typeof displayBrand === 'object' && displayBrand !== null) {
    displayBrand = displayBrand.name || JSON.stringify(displayBrand);
  }
  let displayCategory = category;
  if (typeof displayCategory === 'object' && displayCategory !== null) {
    displayCategory = displayCategory.name || JSON.stringify(displayCategory);
  }

  const dispatch = useDispatch();
  const {userInfo} = useSelector((state) =>state.userAuth);
  const {wishlist} = useSelector((state)=>state.wishlist);


  const isInWishlist =  wishlist && wishlist.products && wishlist.products.some((item) => item._id ===_id);


  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userInfo) {
      toast.error("Please login to use wishlist!");
      window.location.href = "/login";
      return;
    }
    if (isInWishlist) {
      dispatch(removeFromWishlist(_id));
      toast.info("Removed from wishlist!");
    } else {
      dispatch(addToWishlist(_id));
      toast.success("Added to wishlist!");
    }
  };

  return (
    <Link to={`/products/${_id}`} className="flex flex-col h-full group">
      <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
        {activeOffer && <ProductCardOffer offer={activeOffer} />}
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
          <div className="text-right">
            {activeOffer ? (
              <>
                <span className="font-medium text-green-600">
                  {formattedDiscountedPrice}
                </span>
                <p className="text-xs text-gray-500 line-through">
                  {formattedOriginalPrice}
                </p>
              </>
            ) : (
              <span className="font-medium">{formattedOriginalPrice}</span>
            )}
          </div>
        </div>

        <div className="mt-auto pt-4 flex justify-end space-x-2">
          <button
            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors border border-gray-200 z-10"
            onClick={handleWishlistToggle}
          >
            {isInWishlist ? (
              <FaHeart className="w-4 h-4 text-red-500" />
            ) : (
              <FaHeart className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;