import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCategories } from '../../features/categories/categorySlice';
import { FiArrowRight, FiTag } from 'react-icons/fi';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FaRunning, FaBasketballBall, FaFootballBall, FaVolleyballBall } from 'react-icons/fa';

const BACKEND_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5001';

const Categories = () => {
  const dispatch = useDispatch();
  const { categories, isLoading, isError, message } = useSelector((state) => state.categories);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  // Ensure categories is always an array
  const safeCategories = useMemo(() => {
    return Array.isArray(categories)
      ? categories
      : (categories && Array.isArray(categories.categories))
        ? categories.categories
        : [];
  }, [categories]);
      
  // Set first category as active when categories load
  useEffect(() => {
    if (safeCategories.length > 0 && activeCategory === null) {
      setActiveCategory(safeCategories[0]._id);
    }
  }, [safeCategories, activeCategory]);
  
  // Get sport icon based on category name
  const getSportIcon = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('basketball') || nameLower.includes('court')) {
      return <FaBasketballBall className="text-orange-500" />;
    } else if (nameLower.includes('football') || nameLower.includes('soccer')) {
      return <FaFootballBall className="text-green-600" />;
    } else if (nameLower.includes('volleyball') || nameLower.includes('beach')) {
      return <FaVolleyballBall className="text-yellow-500" />;
    }
    return <FaRunning className="text-blue-500" />;
  };

  return (
    <section className="py-12 md:py-20 bg-gray-100 text-black overflow-hidden relative">
      {/* Diagonal stripes background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(135deg,transparent_25%,#000_25%,#000_26%,transparent_26%,transparent_50%,#000_50%,#000_51%,transparent_51%,transparent_75%,#000_75%,#000_76%,transparent_76%)] bg-[length:20px_20px]"></div>
      </div>
      
      {/* Dynamic background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-black to-transparent opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-black to-transparent opacity-5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
      
      {/* Sporty decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-1 bg-black opacity-10 rotate-45"></div>
      <div className="absolute top-14 left-14 w-10 h-1 bg-black opacity-10 rotate-45"></div>
      <div className="absolute bottom-10 right-10 w-20 h-1 bg-black opacity-10 -rotate-45"></div>
      <div className="absolute bottom-14 right-14 w-10 h-1 bg-black opacity-10 -rotate-45"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Modern Header - Nike/Adidas Style */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-2">
              CATEGORIES
            </h1>
            <div className="h-1 w-16 bg-black mx-auto"></div>
            <p className="text-gray-600 text-lg max-w-xl mx-auto mt-6 font-light tracking-wide">
              Performance gear for every athlete
            </p>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-black border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : isError ? (
          <div className="text-center py-12 bg-gray-100 rounded-md border-l-4 border-red-500">
            <p className="text-xl text-red-600">Error: {message}</p>
          </div>
        ) : safeCategories.length === 0 ? (
          <div className="text-center py-12 bg-gray-100 rounded-md border-l-4 border-gray-400">
            <p className="text-xl text-gray-600">No categories available</p>
          </div>
        ) : (
          <>
            {/* Category Navigation Tabs - Nike/Adidas Style */}
            <div className="mb-10 overflow-x-auto hide-scrollbar">
              <div className="flex space-x-1 md:space-x-2 pb-2 md:justify-center">
                {safeCategories.map((category) => (
                  <motion.button
                    key={category._id}
                    className={`px-4 md:px-5 py-2 flex items-center space-x-2 transition-all ${
                      activeCategory === category._id 
                        ? 'bg-black text-white font-bold' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    onClick={() => setActiveCategory(category._id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-lg">{getSportIcon(category.name)}</span>
                    <span className="uppercase text-sm font-medium tracking-wider">{category.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Featured Category Display */}
            {safeCategories.map((category) => (
              <div 
                key={category._id}
                className={`${activeCategory === category._id ? 'block' : 'hidden'}`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
                >
                  {/* Left Content - Adidas/Nike Style */}
                  <div className="lg:col-span-4 order-2 lg:order-1">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1, duration: 0.4 }}
                    >
                      <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-3">
                        {category.name}
                        <span className="block h-1 w-12 bg-black mt-1"></span>
                      </h2>
                      
                      <p className="text-gray-700 mb-6 leading-relaxed">
                        Premium {category.name.toLowerCase()} gear engineered for peak performance.
                      </p>
                      
                      <div className="flex flex-wrap gap-3 mb-6">
                        <div className="bg-gray-100 px-3 py-2 flex items-center">
                          <FiTag className="mr-2 text-black" /> 
                          <span className="font-bold">{category.productCount || '0'}</span>
                          <span className="ml-1 text-gray-600 text-sm uppercase">Items</span>
                        </div>
                      </div>
                      
                      <Link 
                        to={`/products/category/${category.name}`}
                        className="inline-flex items-center gap-2 bg-black text-white px-5 py-2 font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:bg-gray-900 group"
                      >
                        <span>Shop Now</span>
                        <FiArrowRight className="transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </motion.div>
                  </div>
                  
                  {/* Right Image - Smaller Card Size */}
                  <div className="lg:col-span-8 order-1 lg:order-2">
                    <motion.div 
                      className="relative overflow-hidden"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      {/* Minimal overlay */}
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                      
                      {/* Image */}
                      <div className="aspect-[16/10] overflow-hidden">
                        <img
                          src={
                            (category.image && typeof category.image === 'object' && category.image.url)
                              ? category.image.url // Handles new Cloudinary objects
                              : (category.image && typeof category.image === 'string')
                                ? (category.image.startsWith('/uploads')
                                  ? `${BACKEND_URL}${category.image}` // Handles old local paths
                                  : category.image) // Handles old absolute URLs or direct string Cloudinary URLs
                                : 'https://via.placeholder.com/1200x800?text=Sport+Category' // Default placeholder
                          }
                          alt={category.name}
                          className="w-full h-full object-cover object-center transition-all duration-500 hover:scale-105"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/1200x800?text=Sport+Category';
                          }}
                        />
                      </div>
                      
                      {/* Category Badge */}
                      <div className="absolute bottom-4 left-4 z-20">
                        <span className="inline-flex items-center px-3 py-1 bg-white text-black text-xs font-bold uppercase tracking-wider">
                          {category.productCount || '0'} Products
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            ))}
            
            {/* Browse All Categories */}
            <motion.div 
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Link 
                to="/products" 
                className="inline-flex items-center gap-2 bg-black hover:bg-gray-900 text-white px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all duration-300"
              >
                <span>View All Products</span>
                <FiArrowRight />
              </Link>
            </motion.div>
          </>
        )}
      </div>
      
      {/* No additional decorative elements needed at the bottom */}
    </section>
  );
};

export default Categories;