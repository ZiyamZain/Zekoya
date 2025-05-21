import React from 'react';
import { FaTag, FaClock } from 'react-icons/fa';
import { format } from 'date-fns';

const ProductOffer = ({ offer }) => {
  if (!offer) return null;

  // Calculate discounted price
  const calculateDiscount = (price) => {
    if (offer.discountType === 'percentage') {
      return (price * offer.discountValue / 100).toFixed(2);
    } else {
      return offer.discountValue.toFixed(2);
    }
  };

  // Format the discount text
  const formatDiscountText = () => {
    if (offer.discountType === 'percentage') {
      return `${offer.discountValue}% OFF`;
    } else {
      return `₹${offer.discountValue} OFF`;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Calculate time remaining for the offer
  const getTimeRemaining = () => {
    const now = new Date();
    const endDate = new Date(offer.endDate);
    const diffTime = Math.abs(endDate - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      return 'Ends today!';
    } else if (diffDays <= 2) {
      return 'Ends tomorrow!';
    } else {
      return `${diffDays} days left`;
    }
  };

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-amber-200 rounded-lg p-4 my-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <FaTag className="text-orange-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">{offer.name}</h3>
        </div>
        <div className="bg-orange-500 text-white font-bold px-3 py-1 rounded-full text-sm">
          {formatDiscountText()}
        </div>
      </div>
      
      <p className="text-gray-600 mb-3">{offer.description}</p>
      
      <div className="flex items-center text-sm text-gray-500">
        <FaClock className="mr-1" />
        <span>Valid till {formatDate(offer.endDate)} • {getTimeRemaining()}</span>
      </div>
      
      <div className="mt-3 pt-3 border-t border-amber-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Coupon applied automatically at checkout
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductOffer;
