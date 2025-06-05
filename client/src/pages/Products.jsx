import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { getProducts, getProductsByCategory } from '../features/products/productSlice';
import { getCategories } from '../features/categories/categorySlice';
import { getActiveOfferForCategory } from '../features/offers/offerSlice';
import ProductCard from '../components/ProductCard';
import CategoryOffer from '../components/CategoryOffer';
import { FaChevronDown, FaChevronLeft, FaChevronRight,  FaFilter, FaSearch } from 'react-icons/fa';

const Products = () => {
  const dispatch = useDispatch();
  const { categoryName } = useParams();
  const productsState = useSelector((state) => state.products);
  const categoriesState = useSelector((state) => state.categories);
  const { activeCategoryOffer } = useSelector((state) => state.offer);
  
  const products = productsState?.products || [];
  const categories = useMemo(() => Array.isArray(categoriesState?.categories) ? categoriesState.categories : [], [categoriesState?.categories]);
  const isProductsLoading = productsState?.isLoading || false;
  const isCategoriesLoading = categoriesState?.isLoading || false;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFilter, setExpandedFilter] = useState(null);
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    selectedCategory: categoryName || '',
    selectedSizes: [],
    inStockOnly: false,
    featuredOnly: false,
  });

  const [sortOption, setSortOption] = useState('default');

  const productsGridRef = useRef(null);


  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const total = productsState?.total || 0;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
 
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
  
    if (categoryName) {
      setPage(1);
      dispatch(getProductsByCategory({ category: categoryName, page: 1, limit }));
      setFilters((prev) => ({ ...prev, selectedCategory: categoryName }));
      
      // Find the category ID to fetch active offers
      const selectedCategory = categories.find(cat => cat.name === categoryName);
      if (selectedCategory && selectedCategory._id) {
        dispatch(getActiveOfferForCategory(selectedCategory._id));
      }
    } else {
      setPage(1);
      dispatch(getProducts({ page: 1, limit }));
      setFilters((prev) => ({ ...prev, selectedCategory: '' }));
    }
  }, [dispatch, categoryName, limit, categories]);
  
  useEffect(() => {
    if (categoryName) {
      dispatch(getProductsByCategory({ category: categoryName, page, limit }));
    } else {
      dispatch(getProducts({ page, limit }));
    }
  }, [page, dispatch, categoryName, limit]);

  useEffect(() => {
    if (
      filters.selectedCategory &&
      filters.selectedCategory !== categoryName
    ) {
      window.history.replaceState(
        {},
        '',
        `/products/category/${encodeURIComponent(filters.selectedCategory)}`
      );
      setPage(1); 
      dispatch(getProductsByCategory({ category: filters.selectedCategory, page: 1, limit }));
    }
  }, [filters.selectedCategory, categoryName, dispatch, limit]);

  useEffect(() => {
    if (productsGridRef.current) {
      productsGridRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [page]);

  const toggleFilter = (filterName) => {
    setExpandedFilter(expandedFilter === filterName ? null : filterName);
  };

  const handlePriceRangeChange = (event, index) => {
    const newPriceRange = [...filters.priceRange];
    newPriceRange[index] = Number(event.target.value);
    setFilters((prev) => ({ ...prev, priceRange: newPriceRange }));
  };

  const handleSizeToggle = (size) => {
    setFilters((prev) => {
      const selectedSizes = [...prev.selectedSizes];
      const index = selectedSizes.indexOf(size);
      if (index === -1) {
        selectedSizes.push(size);
      } else {
        selectedSizes.splice(index, 1);
      }
      return { ...prev, selectedSizes };
    });
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };


  const handlePrevPage = () => {
    const newPage = Math.max(1, page - 1);
    if (newPage !== page) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const handleNextPage = () => {
    const newPage = Math.min(totalPages, page + 1);
    if (newPage !== page) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filterProducts = (productsList) => {
    let filtered = productsList;
    const matchesSearch = searchTerm === '' || 
      productsList.some((product) => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    if (!matchesSearch) return [];

    filtered = filtered.filter((product) => {
      const matchesPrice =
        product.price >= filters.priceRange[0] &&
        product.price <= filters.priceRange[1];
      
      const matchesSizes =
        filters.selectedSizes.length === 0 ||
        filters.selectedSizes.some((selectedSize) => {

          if (product.sizes && Array.isArray(product.sizes)) {
            return product.sizes.some(sizeObj => {
            
              if (typeof sizeObj === 'object' && sizeObj !== null && 'size' in sizeObj) {
                return sizeObj.size === selectedSize && sizeObj.stock > 0;
              }

              return sizeObj === selectedSize;
            });
          }
          return false;
        });
      
      const matchesStock = !filters.inStockOnly || (product.totalStock && product.totalStock > 0);
      
      const matchesFeatured = !filters.featuredOnly || product.isFeatured;

      return (
        matchesPrice &&
        matchesSizes &&
        matchesStock &&
        matchesFeatured
      );
    });
    return filtered;
  };

  const sortProducts = (products) => {
    if (!products || !Array.isArray(products)) return [];
    
    const productsCopy = [...products];
    
    switch (sortOption) {
      case 'price-asc':
        return productsCopy.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return productsCopy.sort((a, b) => b.price - a.price);
      case 'newest':
        return productsCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'name-asc':
        return productsCopy.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return productsCopy;
    }
  };


  const productsArray = Array.isArray(products) ? products : (products.products || []);

  const filteredProducts = filterProducts(productsArray);
  const sortedProducts = sortProducts(filteredProducts);
  const allSizes = [
    ...new Set(
      productsArray?.flatMap((product) =>
        (product.sizes || []).map((s) =>
          typeof s === 'object' && s !== null ? s.size : s
        )
      ) || []
    ),
  ].sort();

  const isLoading = isProductsLoading || isCategoriesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center text-sm text-gray-500">
          <Link to="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:underline">Products</Link>
          {categoryName && (
            <>
              <span className="mx-2">/</span>
              <span className="font-medium text-black">{categoryName}</span>
            </>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 pb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-medium">
            {categoryName || 'All Products'} 
            {filteredProducts.length > 0 && <span className="ml-2 text-gray-500">({filteredProducts.length})</span>}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select 
                className="appearance-none bg-white border border-gray-200 py-2 pl-4 pr-10 rounded focus:outline-none focus:ring-2 focus:ring-black"
                onChange={handleSortChange}
                value={sortOption}
              >
                <option value="default">Sort By</option>
                <option value="price-asc">Price: Low-High</option>
                <option value="price-desc">Price: High-Low</option>
                <option value="newest">Newest</option>
                <option value="name-asc">Name: A-Z</option>
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row">
          {/* Filters Sidebar */}
          <div className="w-full md:w-64 pr-0 md:pr-8">
            <div className="border-t border-gray-200 py-4">
              <button 
                onClick={() => toggleFilter('price')}
                className="w-full flex justify-between items-center py-2 font-medium"
              >
                Shop By Price
                <FaChevronDown className={`transition-transform ${expandedFilter === 'price' ? 'rotate-180' : ''}`} />
              </button>
              {expandedFilter === 'price' && (
                <div className="mt-2 space-y-4">
                  <div>
                    <label className="block mb-2 text-sm">
                      Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="10"
                      value={filters.priceRange[1]}
                      onChange={(e) => handlePriceRangeChange(e, 1)}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 py-4">
              <button 
                onClick={() => toggleFilter('size')}
                className="w-full flex justify-between items-center py-2 font-medium"
              >
                Size
                <FaChevronDown className={`transition-transform ${expandedFilter === 'size' ? 'rotate-180' : ''}`} />
              </button>
              {expandedFilter === 'size' && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    {allSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeToggle(size)}
                        className={`px-3 py-1 border text-sm font-medium ${
                          filters.selectedSizes.includes(size)
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Display Category Offer if available */}
            {activeCategoryOffer && filters.selectedCategory && (
              <div className="mb-6">
                <CategoryOffer offer={activeCategoryOffer} />
              </div>
            )}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-white">
                <h3 className="text-xl font-medium mb-2">No Products Found</h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            ) : (
              <div ref={productsGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="inline-flex">
                  <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaChevronLeft />
                  </button>
                  <div className="px-4 py-2 border-t border-b border-gray-300 text-sm font-medium">
                    Page {page} of {totalPages}
                  </div>
                  <button
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;