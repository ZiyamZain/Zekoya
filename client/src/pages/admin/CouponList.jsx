import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllCoupons, deleteCoupon, reset } from '../../features/adminSide/coupons/adminCouponSlice';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import moment from 'moment';

const CouponList = () => {
  const dispatch = useDispatch();
  const { coupons, isLoading, isError, isSuccess, message } = useSelector(state => state.adminCoupon);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(getAllCoupons());

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    
    if (isSuccess && message) {
      toast.success(message);
    }
  }, [isError, isSuccess, message]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      dispatch(deleteCoupon(id));
      // Success toast will be shown via useEffect when isSuccess is true
    }
  };

  const filteredCoupons = coupons.filter(coupon => 
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coupon Management</h1>
        <Link 
          to="/admin/coupons/create" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaPlus className="mr-2" /> Add New Coupon
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search coupons..."
          className="w-full p-2 border border-gray-300 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredCoupons.length === 0 ? (
        <div className="text-center py-4">
          <p>No coupons found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Code</th>
                <th className="py-2 px-4 border-b text-left">Description</th>
                <th className="py-2 px-4 border-b text-left">Discount</th>
                <th className="py-2 px-4 border-b text-left">Min Purchase</th>
                <th className="py-2 px-4 border-b text-left">Valid Until</th>
                <th className="py-2 px-4 border-b text-left">Status</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((coupon) => (
                <tr key={coupon._id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{coupon.code}</td>
                  <td className="py-2 px-4">{coupon.description}</td>
                  <td className="py-2 px-4">
                    {coupon.discountType === 'percentage' 
                      ? `${coupon.discountValue}%` 
                      : `₹${coupon.discountValue}`}
                  </td>
                  <td className="py-2 px-4">₹{coupon.minPurchase}</td>
                  <td className="py-2 px-4">{moment(coupon.endDate).format('MMM DD, YYYY')}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-2 px-4 flex space-x-2">
                    <Link to={`/admin/coupons/edit/${coupon._id}`} className="text-blue-600 hover:text-blue-800">
                      <FaEdit />
                    </Link>
                    <button 
                      onClick={() => handleDelete(coupon._id)} 
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CouponList;