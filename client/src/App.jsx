import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import DashboardHome from "./pages/admin/DashboardHome";
import UsersPage from "./pages/admin/UsersPage";
import ProductsPage from "./pages/admin/ProductsPage";
import CouponsPage from "./pages/admin/CouponsPage";
import CategoriesPage from "./pages/admin/CategoriesPage";
import BrandsPage from "./pages/admin/BrandsPage";
import OffersPage from "./pages/admin/OffersPage";
import SettingsPage from "./pages/admin/SettingsPage";
import BannerPage from "./pages/admin/BannerPage";
import OrdersPage from "./pages/admin/OrdersPage";

// User & Auth Pages
import UserRegister from "./pages/auth/UserRegister"; 
import UserLogin from "./pages/auth/UserLogin";
import ForgotPassword from './pages/auth/ForgotPassword';
import Hero from "./pages/user/Hero";
import Featured from "./pages/user/Featured";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";

// Layouts & Protection
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from './layouts/UserLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from "./components/admin/ProtectedRoute";
import ProtectedRouteUser from "./components/user/ProtectedRouteUser";

function App() {
  return (
    <>
      <ToastContainer />
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<UserLogin />} />
            <Route path="/register" element={<UserRegister />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* User Routes */}
          <Route path="/" element={<UserLayout />}>
            <Route index element={<Hero />} />
              <Route path="featured" element={<Featured />} />
              <Route path="products" element={<Products />} />
              <Route path="products/category/:categoryName" element={<Products />} />
              <Route path="products/:productId" element={<ProductDetail />} />
          
          </Route>

          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="coupons" element={<CouponsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="offers" element={<OffersPage />} />
            <Route path="brands" element={<BrandsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="banner" element={<BannerPage />} />
            <Route path="orders" element={<OrdersPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
