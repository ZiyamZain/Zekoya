import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createCoupon, updateCoupon, getAllCoupons, reset } from '../../features/adminSide/coupons/adminCouponSlice';
import { toast } from 'react-toastify';

const CouponForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { coupons, isLoading, isError, isSuccess, message } = useSelector(state => state.adminCoupon);
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchase: 0,
    maxDiscount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    isActive: true
  });

  const { 
    code, description, discountType, discountValue, 
    minPurchase, maxDiscount, startDate, endDate, 
    usageLimit, isActive 
  } = formData;

  // If editing, populate form with coupon data
  useEffect(() => {
    if (id) {
      const couponToEdit = coupons.find(coupon => coupon._id === id);
      
      if (couponToEdit) {
        // Format dates for input fields
        const formattedStartDate = new Date(couponToEdit.startDate)
          .toISOString().split('T')[0];
        const formattedEndDate = new Date(couponToEdit.endDate)
          .toISOString().split('T')[0];

        setFormData({
          ...couponToEdit,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        });
      } else {
        // If coupon not found in state, fetch it
        dispatch(getAllCoupons());
      }
    }

    return () => {
      dispatch(reset());
    };
  }, [id, coupons, dispatch]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess && !id) {
      toast.success('Coupon created successfully');
      navigate('/admin/coupons');
    }

    if (isSuccess && id) {
      toast.success('Coupon updated successfully');
      navigate('/admin/coupons');
    }
  }, [isError, isSuccess, message, navigate, id]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!code || !description || !discountValue || !startDate || !endDate) {
      toast.error('Please fill all required fields');
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    // Create payload
    const couponData = {
      ...formData,
      code: code.toUpperCase(),
      discountValue: Number(discountValue),
      minPurchase: Number(minPurchase),
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null
    };

    if (id) {
      dispatch(updateCoupon({ couponId: id, couponData }));
    } else {
      dispatch(createCoupon(couponData));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">
          {id ? 'Edit Coupon' : 'Create New Coupon'}
        </h1>

        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="code">
              Coupon Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={code}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g. SUMMER20"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Code will be automatically converted to uppercase</p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="description">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g. 20% off on summer collection"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="discountType">
                Discount Type <span className="text-red-500">*</span>
              </label>
              <select
                id="discountType"
                name="discountType"
                value={discountType}
                onChange={onChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="discountValue">
                Discount Value <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="discountValue"
                name="discountValue"
                value={discountValue}
                onChange={onChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder={discountType === 'percentage' ? 'e.g. 20 for 20%' : 'e.g. 100 for ₹100 off'}
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="minPurchase">
                Minimum Purchase Amount
              </label>
              <input
                type="number"
                id="minPurchase"
                name="minPurchase"
                value={minPurchase}
                onChange={onChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g. 500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="maxDiscount">
                Maximum Discount Amount
              </label>
              <input
                type="number"
                id="maxDiscount"
                name="maxDiscount"
                value={maxDiscount}
                onChange={onChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g. 200"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for no maximum</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="startDate">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={startDate}
                onChange={onChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="endDate">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={endDate}
                onChange={onChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="usageLimit">
              Usage Limit
            </label>
            <input
              type="number"
              id="usageLimit"
              name="usageLimit"
              value={usageLimit}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g. 100"
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited usage</p>
          </div>

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={isActive}
                onChange={onChange}
                className="mr-2"
              />
              <span>Active</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/coupons')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {id ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponForm;
