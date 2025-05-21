import React from 'react';

const DiscountedPrice = ({ originalPrice, offer }) => {
  if (!offer) return null;

  // Calculate discounted price
  const calculateDiscountedPrice = () => {
    if (offer.discountType === 'percentage') {
      const discountAmount = originalPrice * (offer.discountValue / 100);
      return originalPrice - discountAmount;
    } else {
      return Math.max(0, originalPrice - offer.discountValue);
    }
  };

  const discountedPrice = calculateDiscountedPrice();
  
  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <span className="text-xl font-medium text-gray-900 mr-2">
          MRP: ₹{discountedPrice.toFixed(2)}
        </span>
        <span className="text-sm line-through text-gray-500">
          ₹{originalPrice.toFixed(2)}
        </span>
      </div>
      <div className="text-sm text-green-600 font-medium">
        {offer.discountType === 'percentage' 
          ? `${offer.discountValue}% OFF` 
          : `₹${offer.discountValue} OFF`}
      </div>
      <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
      <p className="text-sm text-gray-500">
        (Also includes all applicable duties)
      </p>
    </div>
  );
};

export default DiscountedPrice;
