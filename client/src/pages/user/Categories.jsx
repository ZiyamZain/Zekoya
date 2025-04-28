import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCategories } from '../../features/adminSide/categories/categorySlice';
import { FiArrowRight, FiTag } from 'react-icons/fi';

const Categories = () => {
  const dispatch = useDispatch();
  const { categories, isLoading } = useSelector((state) => state.adminCategories);

  useEffect(() => {
    dispatch(getCategories({ page: 1, search: '' }));
  }, [dispatch]);

  return (
    <section className="py-24 relative overflow-hidden" style={{ 
      background: `repeating-linear-gradient(135deg, #fff 0px, #fff 18px, #f3f3f3 18px, #f3f3f3 36px)`,
      boxShadow: '0 6px 32px 0 rgba(0,0,0,0.10)',
      border: '4px solid black',
      borderRadius: '1rem'
    }}>
      {/* Gradient vignette overlay */}
      <div className="pointer-events-none absolute inset-0 z-0" style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.04) 0%, rgba(255,255,255,0.97) 100%)'}} />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Classic Header */}
        <div className="mb-20 text-center">
          <h2 className="text-6xl md:text-7xl font-serif text-black mb-4 tracking-wide relative inline-block">
            Categories
            <div className="absolute -bottom-4 left-0 w-full h-[3px] bg-black"></div>
          </h2>
          <p className="text-[#222] text-lg max-w-2xl mx-auto mt-8 font-serif italic">
            Browse our collection of premium products
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-black border-t-white"></div>
          </div>
        ) : categories?.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-black">
            <p className="text-xl font-serif italic text-[#222]">No categories available</p>
          </div>
        ) : (
          <>
            {/* Horizontal Layout with Enhanced Styling */}
            <div className="space-y-28">
              {categories?.map((category, index) => (
                <div 
                  key={category._id}
                  className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 md:gap-16 items-center`}
                  style={{ 
                    animationDelay: `${index * 0.3}s`,
                    animation: 'fadeInSlide 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
                    opacity: 0,
                    transform: index % 2 === 0 ? 'translateX(-50px)' : 'translateX(50px)'
                  }}
                >
                  {/* Image Side - Larger and with frame */}
                  <div className="w-full md:w-3/5 group">
                    <div className="relative overflow-hidden border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.08)]">
                      {/* Category Image */}
                      <div className="aspect-[4/3] overflow-hidden relative">
                        {/* Soft Focus Effect */}
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMjAwdjIwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] pointer-events-none z-20 mix-blend-multiply"></div>
                        
                        {/* Retro TV Effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-transparent bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.1)_50%,transparent_51%,rgba(0,0,0,0.1)_100%)] bg-[length:100%_4px] pointer-events-none z-20 opacity-20"></div>
                        
                        <img
                          src={category.image ? `http://localhost:5001${category.image}` : 'https://via.placeholder.com/800x600?text=Category+Image'}
                          alt={category.name}
                          className="w-full h-full object-cover object-center transition-all duration-1000 group-hover:scale-105 group-hover:sepia-[0.2] group-hover:contrast-[1.1]"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/800x600?text=Category+Image';
                          }}
                        />
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-700"></div>
                      </div>
                      
                      {/* Category Stats */}
                      <div className="absolute top-4 right-4 z-30">
                        <span className="inline-flex items-center px-3 py-1 bg-black text-white text-sm font-serif">
                          <FiTag className="mr-1" /> {category.productCount || '0'} items
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content Side - More elegant typography */}
                  <div className="w-full md:w-2/5 flex flex-col items-start">
                    <h3 className="text-4xl font-serif text-black mb-4 tracking-wide relative inline-block">
                      {category.name}
                      <span className="absolute -bottom-2 left-0 w-12 h-[2px] bg-black"></span>
                    </h3>
                    <p className="text-[#222] mb-8 text-lg font-serif leading-relaxed">
                      Explore our collection of premium {category.name.toLowerCase()} products designed with style and craftsmanship.
                    </p>
                    <Link 
                      to={`/products/category/${category.name}`}
                      className="relative overflow-hidden inline-flex items-center gap-2 bg-black text-white px-6 py-3 font-serif tracking-wider text-lg border-2 border-black transition-all duration-500 group hover:text-black hover:bg-transparent"
                    >
                      <span className="relative z-10">Explore Collection</span>
                      <FiArrowRight className="relative z-10 transform group-hover:translate-x-2 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-white transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            {/* View All Button */}
            <div className="mt-24 text-center">
              <Link 
                to="/products" 
                className="inline-block bg-black text-white px-10 py-4 font-serif tracking-wider text-xl border-2 border-black hover:bg-transparent hover:text-black transition-colors duration-500 relative overflow-hidden group"
              >
                <span className="relative z-10">View All Products</span>
                <div className="absolute inset-0 bg-white transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500"></div>
              </Link>
            </div>
          </>
        )}
      </div>
      
      {/* Add keyframes for enhanced animations */}
      <style jsx>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: ${categories?.length > 0 && categories[0] ? (categories[0]._id % 2 === 0 ? 'translateX(-50px)' : 'translateX(50px)') : 'translateX(-50px)'};
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
};

export default Categories;