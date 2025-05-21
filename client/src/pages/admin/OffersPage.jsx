import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// Offer components
import ProductOfferList from '../../components/admin/offers/ProductOfferList';
import ProductOfferForm from '../../components/admin/offers/ProductOfferForm';
import CategoryOfferList from '../../components/admin/offers/CategoryOfferList';
import CategoryOfferForm from '../../components/admin/offers/CategoryOfferForm';

const OffersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  
  useEffect(() => {
    console.log('Current path:', path);
  }, [path]);

  // Determine which tab should be active based on the current path
  const getTabValue = () => {
    if (path.includes('/admin/offers/product')) return 0;
    if (path.includes('/admin/offers/category')) return 1;
    return 0; // Default to product offers
  };

  const handleTabChange = (event, newValue) => {
    switch (newValue) {
      case 0:
        navigate('/admin/offers/product');
        break;
      case 1:
        navigate('/admin/offers/category');
        break;
      default:
        navigate('/admin/offers/product');
    }
  };

  // Redirect to product offers if we're at the root /admin/offers path
  useEffect(() => {
    if (path === '/admin/offers') {
      navigate('/admin/offers/product');
    }
  }, [path, navigate]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8" aria-label="Offer management tabs">
          <button
            onClick={() => handleTabChange(null, 0)}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${getTabValue() === 0 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Product Offers
          </button>
          <button
            onClick={() => handleTabChange(null, 1)}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${getTabValue() === 1 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Category Offers
          </button>
        </nav>
      </div>

      <div className="mt-6">
        <Routes>
          {/* Product Offer Routes */}
          <Route path="product" element={<ProductOfferList />} />
          <Route path="product/create" element={<ProductOfferForm />} />
          <Route path="product/edit/:id" element={<ProductOfferForm />} />

          {/* Category Offer Routes */}
          <Route path="category" element={<CategoryOfferList />} />
          <Route path="category/create" element={<CategoryOfferForm />} />
          <Route path="category/edit/:id" element={<CategoryOfferForm />} />

          {/* Default Route */}
          <Route index element={<Navigate to="product" replace />} />
          <Route path="*" element={<Navigate to="product" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default OffersPage;