import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { validateCoupon, clearActiveCoupon, reset } from '../../features/coupons/couponSlice';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';

const CouponApply = ({ orderTotal, onCouponApplied }) => {
  const [couponCode, setCouponCode] = useState('');
  const dispatch = useDispatch();
  
  const { activeCoupon, isLoading, isError, isSuccess, message } = useSelector(
    state => state.coupon
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess && activeCoupon) {
      toast.success(`Coupon ${activeCoupon.coupon.code} applied successfully`);
      onCouponApplied(activeCoupon);
    }

    return () => {
      dispatch(reset());
    };
  }, [isError, isSuccess, message, activeCoupon, dispatch, onCouponApplied]);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    
    dispatch(validateCoupon({ code: couponCode, orderAmount: orderTotal }));
  };

  const handleRemoveCoupon = () => {
    dispatch(clearActiveCoupon());
    setCouponCode('');
    onCouponApplied(null);
    toast.info('Coupon removed');
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
              {activeCoupon.coupon.discountType === 'percentage' 
                ? `${activeCoupon.coupon.discountValue}% off` 
                : `₹${activeCoupon.coupon.discountValue} off`}
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
        <form onSubmit={handleApplyCoupon} className="flex space-x-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="flex-grow p-2 border border-gray-300 rounded-md"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isLoading ? 'Applying...' : 'Apply'}
          </button>
        </form>
      )}
    </div>
  );
};

export default CouponApply;
