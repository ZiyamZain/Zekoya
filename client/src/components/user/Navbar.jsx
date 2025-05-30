import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { userLogout } from "../../features/userAuth/userAuthSlice";
import {
  FiSearch,
  FiHeart,
  FiShoppingBag,
  FiUser,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { FaChevronDown } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Navbar = () => {
  const [isTopBannerOpen, setIsTopBannerOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const userInfo = useSelector((state) => state.userAuth.userInfo);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const mainNavItems = [
    { name: "Home", path: "/" },
    { name: "Featured", path: "/featured" },
    { name: "About Us", path: "/about-us" },
    { name: "Clubs", path: "/products/category/club jerseys"},
    { name: "Retro", path: "/products/category/retro jerseys" },
  ];

  const handleLogout = () => {
    dispatch(userLogout());
    toast.success("Logged out successfully!");
    navigate("/");
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {/* Navbar */}
      <header className="bg-white shadow-sm">
        {/* Top Banner */}
        {isTopBannerOpen && (
          <div className="bg-gradient-to-r from-black via-black to-gray-900 text-white py-2 px-4 text-center relative">
            <button
              onClick={() => setIsTopBannerOpen(false)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:opacity-75 transition-opacity"
            >
              <FiX className="h-4 w-4" />
            </button>
            <div className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-75 transition-opacity">
              <span className="text-sm font-medium tracking-wider uppercase">Free Shipping on Orders Over ₹1000</span>
            </div>
          </div>
        )}

        {/* Secondary Navigation */}
        <div className="hidden md:block bg-gray-50 border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex justify-end items-center py-2 text-xs space-x-6">
              <Link to="/help" className="hover:text-black text-gray-600 transition-colors duration-200 uppercase tracking-wider font-medium">
                Help
              </Link>
              <Link to="/orders" className="hover:text-black text-gray-600 transition-colors duration-200 uppercase tracking-wider font-medium">
                Orders & Returns
              </Link>

              {userInfo ? (
                <button
                  onClick={handleLogout}
                  className="hover:text-black text-gray-600 transition-colors duration-200 uppercase tracking-wider font-medium bg-transparent border-none p-0 cursor-pointer"
                >
                  Log Out
                </button>
              ) : (
                <Link to="/login" className="hover:text-black text-gray-600 transition-colors duration-200 uppercase tracking-wider font-medium">
                  Log In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="relative">
          {/* Diagonal stripe background - sports-inspired design element */}
          <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_12px)]"></div>
          </div>
          
          <div className="container mx-auto px-4 relative">
            <div className="flex items-center justify-between h-20">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden hover:opacity-75 transition-opacity"
              >
                <FiMenu className="h-6 w-6" />
              </button>

              {/* Logo */}
              <Link
                to="/"
                className="flex-shrink-0 hover:opacity-90 transition-opacity font-bold text-2xl tracking-tight relative"
              >
                <span className="relative z-10">ZEKOYA</span>
                {/* Logo accent */}
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-red-600 transform -skew-x-12"></span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center">
                <ul className="flex space-x-1">
                  {mainNavItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.path}
                        className={`relative px-4 py-2 text-sm font-bold tracking-wider uppercase transition-all duration-200 hover:text-red-600 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-red-600 after:transition-all after:duration-300 hover:after:w-full ${
                          item.highlight ? "text-red-600" : "text-gray-900"
                        }`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Search and Icons */}
              <div className="flex items-center">
                <div className="hidden md:flex items-center mr-6 relative">
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="bg-gray-50 border border-gray-200 rounded-none py-1 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && navigate(`/search?q=${searchQuery}`)}
                  />
                  <FiSearch className="absolute right-2 h-4 w-4 text-gray-500" />
                </div>
                
                <div className="flex items-center space-x-5">
                  <button className="md:hidden hover:opacity-75 transition-opacity">
                    <FiSearch className="h-5 w-5" />
                  </button>
                  <Link to="/profile" className="hover:opacity-75 transition-opacity relative group">
                    <FiUser className="h-5 w-5" />
                    <span className="absolute -bottom-1 -right-1 w-0 h-[2px] bg-black group-hover:w-full transition-all duration-300"></span>
                  </Link>
                  <Link to="/wishlist" className="hover:opacity-75 transition-opacity relative group">
                    <FiHeart className="h-5 w-5" />
                    <span className="absolute -bottom-1 -right-1 w-0 h-[2px] bg-black group-hover:w-full transition-all duration-300"></span>
                  </Link>
                  <Link to="/cart" className="hover:opacity-75 transition-opacity relative group">
                    <FiShoppingBag className="h-5 w-5" />
                    <span className="absolute -bottom-1 -right-1 w-0 h-[2px] bg-black group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 fixed inset-0 z-50 overflow-y-auto">
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-between items-center mb-6">
                <Link
                  to="/"
                  className="flex-shrink-0 font-bold text-2xl tracking-tight"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ZEKOYA
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:opacity-75 transition-opacity"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              
              {/* Search Bar */}
              <div className="relative mb-8">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="w-full bg-gray-50 border border-gray-200 py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      navigate(`/search?q=${searchQuery}`);
                      setIsMobileMenuOpen(false);
                    }
                  }}
                />
                <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
              
              <div className="flex flex-col">
                {/* Main Navigation Items */}
                <div className="space-y-5 mb-8">
                  {mainNavItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`block text-lg font-bold uppercase tracking-wider transition-colors duration-200 ${
                        item.highlight ? "text-red-600" : "text-gray-900 hover:text-red-600"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                
                {/* Account Links */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-900 hover:text-red-600 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FiUser className="h-5 w-5" />
                    <span className="font-medium">My Account</span>
                  </Link>
                  <Link
                    to="/wishlist"
                    className="flex items-center space-x-2 text-gray-900 hover:text-red-600 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FiHeart className="h-5 w-5" />
                    <span className="font-medium">Wishlist</span>
                  </Link>
                  <Link
                    to="/cart"
                    className="flex items-center space-x-2 text-gray-900 hover:text-red-600 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FiShoppingBag className="h-5 w-5" />
                    <span className="font-medium">Cart</span>
                  </Link>
                  <Link
                    to="/orders"
                    className="flex items-center space-x-2 text-gray-900 hover:text-red-600 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="font-medium">Orders</span>
                  </Link>
                </div>
                
                {/* Secondary Links */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex flex-col space-y-4">
                    <Link
                      to="/help"
                      className="text-sm font-medium text-gray-600 hover:text-black transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Help & Support
                    </Link>
                    <Link
                      to="/register"
                      className="text-sm font-medium text-gray-600 hover:text-black transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Create Account
                    </Link>
                    {userInfo ? (
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleLogout();
                        }}
                        className="text-sm font-medium text-gray-600 hover:text-black transition-colors duration-200 bg-transparent border-none p-0 cursor-pointer text-left"
                      >
                        Log Out
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        className="text-sm font-medium text-gray-600 hover:text-black transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Log In
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
