import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CouponList from './CouponList';
import CouponForm from './CouponForm';

const CouponsPage = () => {
  return (
    <Routes>
      <Route index element={<CouponList />} />
      <Route path="create" element={<CouponForm />} />
      <Route path="edit/:id" element={<CouponForm />} />
      <Route path="*" element={<Navigate to="/admin/coupons" replace />} />
    </Routes>
  );
};

export default CouponsPage;