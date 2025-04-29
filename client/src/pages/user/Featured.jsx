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
    
  
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    

    if (imagePath.includes('/server/uploads/')) {
      const filename = imagePath.split('/server/uploads/').pop();
      return `http://localhost:5001/uploads/${filename}`;
    }
    

    return `http://localhost:5001${imagePath}`;
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
          <div className="inline-block bg-black py-2 px-8 -rotate-2 transform mb-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {featuredProducts?.map((product) => (
              <Link
                key={product._id}
                to={`/product/${product._id}`}
                className="group block bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:-translate-y-2 hover:shadow-2xl duration-300"
              >
                <div>
                  {/* Sale Badge */}
                  {product.onSale && (
                    <div className="absolute top-0 right-0 z-30 bg-red-600 text-white transform rotate-[15deg] origin-top-right shadow-md">
                      <div className="py-1 px-8 text-sm font-['Bebas_Neue'] tracking-wider">SALE</div>
                    </div>
                  )}
                  {/* Image Container */}
                  <div className="relative h-56 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 z-10"></div>
                    <img
                      src={getImageUrl(product.images[0])}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x500?text=Image+Not+Found';
                      }}
                    />
                    {/* Vintage Overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(#000_0.5px,transparent_1px)] [background-size:12px_12px] opacity-10 mix-blend-multiply pointer-events-none"></div>
                    {/* Shop Now Button */}
                    <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="bg-black text-white px-6 py-2 font-['Bebas_Neue'] tracking-wider text-lg flex items-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        SHOP NOW <FiArrowRight className="ml-2" />
                      </span>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-3 space-y-1.5">
                    {/* Category Tag */}
                    <div className="mb-2">
                      <span className="inline-block bg-black text-white text-xs px-3 py-1 font-['Bebas_Neue'] tracking-wider">
                        {product.category?.name || 'PRODUCT'}
                      </span>
                    </div>
                    {/* Product Name */}
                    <h3 className="text-md font-semibold text-amber-900 line-clamp-1">{product.name}</h3>
                    {/* Price & Stock */}
                    <div className="flex justify-between items-center pt-2">
                      {product.onSale ? (
                        <>
                          <p className="text-lg font-medium text-amber-900">₹{Math.round(product.price * 0.9)}</p>
                          <p className="text-sm text-gray-500 line-through">₹{product.price}</p>
                        </>
                      ) : (
                        <p className="text-lg font-medium text-amber-900">₹{product.price}</p>
                      )}
                      <div className="flex items-center">
                        <span className={`h-3 w-3 rounded-full mr-1 ${product.sizes.some(size => size.stock > 0) ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-xs uppercase font-medium">
                          {product.sizes.some(size => size.stock > 0) ? 'In Stock' : 'Sold Out'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
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