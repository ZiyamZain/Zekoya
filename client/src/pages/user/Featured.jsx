import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getFeaturedProducts } from '../../features/adminSide/products/productSlice';
import { FiArrowRight, FiShoppingBag } from 'react-icons/fi';

const Featured = () => {
  const dispatch = useDispatch();
  const { featuredProducts, isLoading } = useSelector((state) => state.adminProducts);

  useEffect(() => {
    dispatch(getFeaturedProducts());
  }, [dispatch]);


  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return '';
    }
    
    // Handle Cloudinary image object structure
    if (typeof imagePath === 'object' && imagePath !== null && imagePath.url) {
      return imagePath.url;
    }
  
    // Existing logic for string paths (local or absolute URLs)
    if (typeof imagePath === 'string') {
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      
      if (imagePath.includes('/server/uploads/')) {
        const filename = imagePath.split('/server/uploads/').pop();
        return `http://localhost:5001/uploads/${filename}`;
      }
      
      return `http://localhost:5001${imagePath}`;
    }

    // Fallback if imagePath is not a recognized object or string
    return ''; // Or a placeholder like 'https://via.placeholder.com/400x500?text=Image+Invalid'
  };

  return (
    <section className="py-20 bg-white" style={{ 
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      backgroundAttachment: 'fixed'
    }}>
      {/* Content */}
      <div className="container mx-auto px-4">
        {/* Retro Header */}
        <div className="mb-12 text-center">
          <div className="inline-block bg-black py-2 px-8 -rotate-2 transform mb-20">
            <h2 className="text-5xl md:text-6xl font-['Bebas_Neue'] text-white tracking-wider">
              FEATURED COLLECTION
            </h2>
          </div>
          <p className="text-gray-700 text-lg max-w-2xl mx-auto font-medium italic">
            Discover our handpicked selection of premium vintage-inspired products
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-black border-t-transparent"></div>
          </div>
        ) : featuredProducts?.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border-4 border-dashed border-gray-300">
            <FiShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-xl font-medium text-gray-600">No featured products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
            {featuredProducts?.map((product) => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="group block overflow-hidden transition-all duration-300 relative"
              >
                {/* Main card with border */}
                <div className="relative border-2 border-black bg-white">
                  {/* Sale Badge */}
                  {product.onSale && (
                    <div className="absolute top-0 right-0 z-30">
                      <div className="bg-black text-white py-1 px-4 text-sm font-bold uppercase tracking-wider transform rotate-45 origin-bottom-left translate-x-[30%] translate-y-[-30%] shadow-md">
                        Sale
                      </div>
                    </div>
                  )}
                  
                  {/* Team/League Badge */}
                  <div className="absolute top-3 left-3 z-30">
                    <div className="bg-black text-white py-1 px-3 text-xs font-bold uppercase tracking-wider">
                      {product.category?.name || 'Product'}
                    </div>
                  </div>
                  
                  {/* Image Container */}
                  <div className="relative h-80 overflow-hidden border-b-2 border-black">
                    {/* Image */}
                    <img
                      src={getImageUrl(product.images[0])}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x500?text=Image+Not+Found';
                      }}
                    />
                    
                    {/* Overlay with stripes pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_12px)]"></div>
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <span className="bg-white text-black px-6 py-3 font-bold text-sm uppercase tracking-wider transform translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center">
                        View Details <FiArrowRight className="ml-2" />
                      </span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    {/* Product Name */}
                    <h3 className="text-lg font-bold text-black tracking-tight line-clamp-1 mb-2">{product.name}</h3>
                    
                    {/* Divider */}
                    <div className="w-12 h-1 bg-black mb-3"></div>
                    
                    {/* Price & Stock */}
                    <div className="flex justify-between items-center">
                      {/* Price */}
                      <div>
                        {product.onSale ? (
                          <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-black text-black">₹{Math.round(product.price * 0.9)}</p>
                            <p className="text-sm text-gray-500 line-through">₹{product.price}</p>
                          </div>
                        ) : (
                          <p className="text-2xl font-black text-black">₹{product.price}</p>
                        )}
                      </div>
                      
                      {/* Stock Status */}
                      <div className="border border-black px-2 py-1">
                        <span className="text-xs uppercase font-bold flex items-center">
                          <span className={`inline-block h-2 w-2 mr-1 rounded-full ${product.sizes.some(size => size.stock > 0) ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {product.sizes.some(size => size.stock > 0) ? 'Available' : 'Sold Out'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Shadow element for 3D effect */}
                <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 -z-10 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-300"></div>
              </Link>
            ))}
          </div>
        )}
        
        {/* View All Button */}
        <div className="mt-16 text-center">
          <Link 
            to="/products" 
            className="inline-block bg-black text-white px-8 py-3 font-['Bebas_Neue'] tracking-wider text-xl border-2 border-black hover:bg-white hover:text-black  duration-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transform transition-all"
          >
            VIEW ALL PRODUCTS
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Featured;