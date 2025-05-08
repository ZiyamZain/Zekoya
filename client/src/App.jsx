import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/toast.css"; // Custom toast styles

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
import OrderDetailPage from "./pages/admin/OrderDetailPage";
import AdminAuthTest from "./pages/admin/AdminAuthTest";
import UserProfile from "./pages/user/UserProfile"; 
import ChangePassword from "./pages/user/ChangePassword";
import ChangeEmail from "./pages/user/ChangeEmail";
import AddAddress from "./pages/user/AddAddress";
import EditAddress from "./pages/user/EditAddress";
import EditProfile from "./pages/user/EditProfile";

// User & Auth Pages
import UserRegister from "./pages/auth/UserRegister";
import UserLogin from "./pages/auth/UserLogin";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Hero from "./pages/user/Hero";
import Featured from "./pages/user/Featured";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/user/Cart";
import Wishlist from "./pages/user/Wishlist";
import OrderHistory from "./pages/user/OrderHistory";
import OrderDetails from "./pages/user/OrderDetails";
import Checkout from "./pages/user/Checkout";
import OrderSuccess from "./pages/user/OrderSuccess";


// Layouts & Protection
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import AuthLayout from "./layouts/AuthLayout";
import ProtectedRoute from "./components/admin/ProtectedRoute";

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastClassName="font-bold"
      />
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
            <Route
              path="products/category/:categoryName"
              element={<Products />}
            />
            <Route path="products/:productId" element={<ProductDetail />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="profile/edit" element={<EditProfile />} />
            <Route
              path="profile/change-password"
              element={<ChangePassword />}
            />
            <Route path="profile/change-email" element={<ChangeEmail />} />
            <Route path="profile/addresses/add" element={<AddAddress />} />
            <Route
              path="profile/addresses/edit/:addressId"
              element={<EditAddress />}
            />
            <Route path="cart" element={<Cart />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="order-success/:orderId" element={<OrderSuccess />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="orders" element={<OrderHistory />} />
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
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="auth-test" element={<AdminAuthTest />} />

          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
