import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAvailableCoupons, validateCoupon, clearActiveCoupon } from '../../features/coupons/couponSlice';
import { FaTag, FaPercent, FaRupeeSign, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const CouponDropdown = ({ orderTotal, onCouponApplied }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const { availableCoupons, isLoading, activeCoupon } = useSelector(state => state.coupon);

  useEffect(() => {
    if (orderTotal > 0) {
      dispatch(getAvailableCoupons(orderTotal));
    }
  }, [dispatch, orderTotal]);

  const handleApplyCoupon = (code) => {
    dispatch(validateCoupon({ code, orderAmount: orderTotal }));
    setIsOpen(false);
  };

  const handleRemoveCoupon = () => {
    dispatch(clearActiveCoupon());
    onCouponApplied(null);
    toast.info('Coupon removed');
  };

  // Format the date to a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Format discount for display
  const formatDiscount = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% off${coupon.maxDiscount ? ` up to ₹${coupon.maxDiscount}` : ''}`;
    } else {
      return `₹${coupon.discountValue} off`;
    }
  };

  return (
    <div className="mt-4 mb-6">
      <h3 className="text-lg font-semibold mb-2">Apply Coupon</h3>
      
      {activeCoupon ? (
        <div className="flex items-center justify-between bg-green-50 p-3 rounded-md border border-green-200">
          <div>
            <p className="font-medium text-green-800">
              Coupon Applied: {activeCoupon.coupon.code}
            </p>
            <p className="text-sm text-green-700">
              {formatDiscount(activeCoupon.coupon)}
            </p>
            <p className="text-sm text-green-700">
              You saved: ₹{activeCoupon.discountAmount}
            </p>
          </div>
          <button 
            onClick={handleRemoveCoupon}
            className="text-red-600 hover:text-red-800"
            aria-label="Remove coupon"
          >
            <FaTimes />
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full p-2 border border-gray-300 rounded-md bg-white flex justify-between items-center"
            disabled={isLoading || availableCoupons.length === 0}
          >
            <span className="flex items-center text-gray-600">
              <FaTag className="mr-2" />
              {isLoading ? 'Loading coupons...' : availableCoupons.length === 0 ? 'No coupons available' : 'Select a coupon'}
            </span>
            <span className="text-gray-400">▼</span>
          </button>
          
          {isOpen && availableCoupons.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {availableCoupons.map((couponData) => {
                const { coupon, discountAmount } = couponData;
                
                return (
                  <div 
                    key={coupon._id}
                    onClick={() => handleApplyCoupon(coupon.code)}
                    className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-blue-600">{coupon.code}</div>
                        <p className="text-sm text-gray-700">{coupon.description}</p>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          {coupon.discountType === 'percentage' ? (
                            <FaPercent className="mr-1 text-blue-500" />
                          ) : (
                            <FaRupeeSign className="mr-1 text-blue-500" />
                          )}
                          {formatDiscount(coupon)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Min. Order: ₹{coupon.minPurchase} | Valid till: {formatDate(coupon.endDate)}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        Save ₹{discountAmount}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      {!activeCoupon && availableCoupons.length > 0 && (
        <div className="text-xs text-gray-500 flex items-center mt-1">
          <FaInfoCircle className="mr-1" />
          Select a coupon to apply it to your order
        </div>
      )}
    </div>
  );
};

export default CouponDropdown;
