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
    { name: "FEATURED", path: "/club-jerseys" },
    { name: "CLUBS", path: "/international-jerseys" },
    { name: "RETRO", path: "/retro-jerseys" },
    { name: "TRAINING KIT", path: "/training-jerseys" },
    { name: "CRICKET", path: "/cricket-jerseys" },
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
      <header className="bg-white">
        {/* Top Banner */}
        {isTopBannerOpen && (
          <div className="bg-black text-white py-2 px-4 text-center relative">
            <button
              onClick={() => setIsTopBannerOpen(false)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:opacity-75"
            >
              <FiX className="h-4 w-4" />
            </button>
            <div className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-75">
              <span className="text-sm">WEL-COME</span>
              {/* <FaChevronDown className="h-3 w-3" /> */}
            </div>
          </div>
        )}

        {/* Secondary Navigation */}
        <div className="hidden md:block bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex justify-end items-center py-2 text-xs space-x-4">
              <Link to="/help" className="hover:underline text-gray-600">
                help
              </Link>
              <Link to="/orders" className="hover:underline text-gray-600">
                orders and returns
              </Link>

              {userInfo ? (
                <button
                  onClick={handleLogout}
                  className="hover:underline text-gray-600 bg-transparent border-none p-0 cursor-pointer"
                >
                  log out
                </button>
              ) : (
                <Link to="/login" className="hover:underline text-gray-600">
                  log in
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden hover:opacity-75"
              >
                <FiMenu className="h-6 w-6" />
              </button>

              {/* Logo */}
              <Link
                to="/"
                className="flex-shrink-0 hover:opacity-75 font-semibold"
              >
                ZEKOYA
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                {mainNavItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`text-sm font-medium hover:opacity-75 transition-opacity ${
                      item.highlight ? "text-red-600" : "text-gray-900"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Search and Icons */}
              <div className="flex items-center space-x-4">
                <button className="md:hidden hover:opacity-75">
                  <FiSearch className="h-6 w-6" />
                </button>
                <Link to="/profile" className="hover:opacity-75">
                  <FiUser className="h-6 w-6" />
                </Link>
                <Link to="/wishlist" className="hover:opacity-75">
                  <FiHeart className="h-6 w-6" />
                </Link>
                <Link to="/cart" className="hover:opacity-75">
                  <FiShoppingBag className="h-6 w-6" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200">
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-4">
                {mainNavItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`text-lg font-medium hover:opacity-75 transition-opacity ${
                      item.highlight ? "text-red-600" : "text-gray-900"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex flex-col space-y-4">
                    <Link
                      to="/help"
                      className="text-sm hover:underline text-gray-600"
                    >
                      help
                    </Link>
                    <Link
                      to="/orders"
                      className="text-sm hover:underline text-gray-600"
                    >
                      orders and returns
                    </Link>
                    <Link
                      to="/register"
                      className="text-sm hover:underline text-gray-600"
                    >
                      sign up
                    </Link>
                    {userInfo ? (
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleLogout();
                        }}
                        className="text-sm hover:underline text-gray-600 bg-transparent border-none p-0 cursor-pointer text-left"
                      >
                        log out
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        className="text-sm hover:underline text-gray-600"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        log in
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
