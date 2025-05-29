import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { validateCoupon, clearActiveCoupon, reset, getAvailableCoupons } from '../../features/coupons/couponSlice';
import { toast } from 'react-toastify';
import { FaTimes, FaTag, FaPercent, FaRupeeSign, FaInfoCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const CouponApply = ({ orderTotal, onCouponApplied }) => {
  const [couponCode, setCouponCode] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  
  const { activeCoupon, availableCoupons, isLoading, isError, isSuccess, message } = useSelector(
    state => state.coupon
  );

  // Fetch available coupons when component mounts or orderTotal changes
  useEffect(() => {
    if (orderTotal > 0) {
      dispatch(getAvailableCoupons(orderTotal));
    }
  }, [dispatch, orderTotal]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess && activeCoupon) {
      toast.success(`Coupon ${activeCoupon.coupon.code} applied successfully`);
      
      // Ensure discount amount is a number before passing it up
      const discountAmount = parseFloat(activeCoupon.discountAmount);
      
      // Pass the complete coupon data with proper numeric discount amount
      onCouponApplied({
        coupon: activeCoupon.coupon,
        discountAmount: discountAmount
      });
      
      setIsOpen(false); // Close dropdown after applying
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
    
    // Make sure to parse orderTotal as a number for proper discount calculation
    dispatch(validateCoupon({ 
      code: couponCode, 
      orderAmount: parseFloat(orderTotal) 
    }));
  };

  const handleApplyAvailableCoupon = (code) => {
    dispatch(validateCoupon({ 
      code, 
      orderAmount: parseFloat(orderTotal) 
    }));
  };

  const handleRemoveCoupon = () => {
    dispatch(clearActiveCoupon());
    setCouponCode('');
    onCouponApplied(null);
    toast.info('Coupon removed');
  };

  // Format the date to a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // If a coupon is already applied, show the applied coupon
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
                You saved: ₹{parseFloat(discountAmount).toFixed(2)}
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
            Apply Coupon {availableCoupons.length > 0 && `(${availableCoupons.length} available)`}
          </span>
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        
        {/* Dropdown content */}
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
            {/* Manual coupon entry */}
            <div className="p-3 border-b border-gray-200">
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
            </div>
            
            {/* Available coupons section */}
            {availableCoupons.length > 0 ? (
              <>
                <div className="p-2 bg-gray-50 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-700">Available Coupons</p>
                </div>
                
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
                          onClick={() => handleApplyAvailableCoupon(coupon.code)}
                          className="mt-2 w-full px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          Apply
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="p-3 text-center text-gray-500">
                <p>No coupons available for this order</p>
              </div>
            )}
            
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

export default CouponApply;
