import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAvailableCoupons, validateCoupon } from '../../features/coupons/couponSlice';
import { FaTag, FaPercent, FaRupeeSign, FaInfoCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AvailableCoupons = ({ orderTotal, onCouponApplied }) => {
  const dispatch = useDispatch();
  const { availableCoupons, isLoading, activeCoupon } = useSelector(state => state.coupon);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (orderTotal > 0) {
      dispatch(getAvailableCoupons(orderTotal));
    }
  }, [dispatch, orderTotal]);

  const handleApplyCoupon = (code) => {
    dispatch(validateCoupon({ code, orderAmount: orderTotal }));
    setIsOpen(false); // Close dropdown after applying
  };

  // Format the date to a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // If no coupons are available or still loading initial data
  if (isLoading && availableCoupons.length === 0) {
    return (
      <div className="mt-4 mb-4">
        <button 
          className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 rounded-md text-gray-600 font-medium"
          disabled
        >
          <span>Loading coupons...</span>
          <FaChevronDown />
        </button>
      </div>
    );
  }

  // If no coupons are available for this order
  if (availableCoupons.length === 0 && !isLoading) {
    return (
      <div className="mt-4 mb-4">
        <button 
          className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 rounded-md text-gray-500 font-medium"
          disabled
        >
          <span>No coupons available</span>
          <FaChevronDown />
        </button>
      </div>
    );
  }

  // If a coupon is already applied
  if (activeCoupon) {
    const { coupon, discountAmount } = activeCoupon;
    return (
      <div className="mt-4 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-green-800 flex items-center">
                <FaTag className="mr-2" /> {coupon.code} applied
              </p>
              <p className="text-sm text-green-700 mt-1">
                {coupon.discountType === 'percentage' 
                  ? `${coupon.discountValue}% off` 
                  : `₹${coupon.discountValue} off`}
              </p>
              <p className="text-sm text-green-700">
                You saved: ₹{discountAmount}
              </p>
            </div>
            <button
              onClick={() => {
                dispatch({ type: 'coupon/clearActiveCoupon' });
                onCouponApplied(null);
                toast.info('Coupon removed');
              }}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 mb-4">
      <div className="relative">
        {/* Dropdown toggle button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-md text-blue-600 font-medium hover:bg-blue-100"
        >
          <span className="flex items-center">
            <FaTag className="mr-2" /> 
            {availableCoupons.length} {availableCoupons.length === 1 ? 'coupon' : 'coupons'} available
          </span>
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        
        {/* Dropdown content */}
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
            <div className="max-h-60 overflow-y-auto">
              {availableCoupons.map((couponData) => {
                const { coupon, discountAmount } = couponData;
                
                return (
                  <div 
                    key={coupon._id} 
                    className="border-b last:border-b-0 p-3 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800 flex items-center">
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs mr-2">
                            {coupon.code}
                          </span>
                          {coupon.description}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {coupon.discountType === 'percentage' ? (
                            <>
                              <FaPercent className="inline mr-1 text-blue-500" />
                              {coupon.discountValue}% off
                              {coupon.maxDiscount && ` up to ₹${coupon.maxDiscount}`}
                            </>
                          ) : (
                            <>
                              <FaRupeeSign className="inline mr-1 text-blue-500" />
                              {coupon.discountValue} off
                            </>
                          )}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-gray-500">
                            Min: ₹{coupon.minPurchase} | Valid till: {formatDate(coupon.endDate)}
                          </p>
                          <p className="text-xs text-green-600 font-medium">
                            Save ₹{discountAmount}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleApplyCoupon(coupon.code)}
                      className="mt-2 w-full px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                    >
                      Apply
                    </button>
                  </div>
                );
              })}
            </div>
            
            {/* Help text */}
            <div className="text-xs text-gray-500 p-2 border-t border-gray-100 bg-gray-50">
              <FaInfoCircle className="inline mr-1" />
              Only one coupon can be applied per order
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableCoupons;
