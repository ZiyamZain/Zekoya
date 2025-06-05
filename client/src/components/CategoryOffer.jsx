import React from 'react';
import { FaPercentage, FaClock } from 'react-icons/fa';
import { format } from 'date-fns';

const CategoryOffer = ({ offer }) => {
  if (!offer) return null;

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
    } catch {
      // If formatting fails, return the original string
      // console.warn(`Could not format date: ${dateString}`); // Optional: for debugging
      return dateString;
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center">
          <FaPercentage className="text-indigo-500 mr-2" />
          <h3 className="text-base font-semibold text-gray-800">{offer.name}</h3>
        </div>
        <div className="bg-indigo-500 text-white font-bold px-3 py-1 rounded-full text-xs">
          {formatDiscountText()}
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-2">{offer.description}</p>
      
      <div className="flex items-center text-xs text-gray-500">
        <FaClock className="mr-1" />
        <span>Valid till {formatDate(offer.endDate)}</span>
      </div>
    </div>
  );
};

export default CategoryOffer;
