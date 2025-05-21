import React from 'react';
import { FaTag } from 'react-icons/fa';

const ProductCardOffer = ({ offer }) => {
  if (!offer) return null;

  // Format the discount text
  const formatDiscountText = () => {
    if (offer.discountType === 'percentage') {
      return `${offer.discountValue}% OFF`;
    } else {
      return `₹${offer.discountValue} OFF`;
    }
  };

  return (
    <div className="absolute top-0 left-0 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-br-md flex items-center">
      <FaTag className="mr-1" size={10} />
      {formatDiscountText()}
    </div>
  );
};

export default ProductCardOffer;
