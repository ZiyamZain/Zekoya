import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTag, FaPercent, FaGift, FaArrowRight } from 'react-icons/fa';
import { format } from 'date-fns';
import { offerAxios } from "../utils/userAxiosConfig"; // Adjust path as needed
import { getImageUrl } from "../utils/imageUtils"; // Adjust path as needed
import ProductOffer from '../components/ProductOffer';
import CategoryOffer from '../components/CategoryOffer';

const Offers = () => {
  const [offers, setOffers] = useState({
    productOffers: [],
    categoryOffers: [],
    referralOffers: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOffers = async () => {
      setIsLoading(true);
      try {
        const response = await offerAxios.get('/active');
        setOffers(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching offers:', err);
        setError('Failed to load offers. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (error) { // eslint-disable-line no-unused-vars
      return dateString;
    }
  };

  // Render referral offer card
  const ReferralOfferCard = ({ offer }) => {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <FaGift className="text-purple-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">{offer.rewardType === 'percentage' ? 'Percentage Discount' : 'Fixed Amount'}</h3>
          </div>
          <div className="bg-purple-500 text-white font-bold px-3 py-1 rounded-full text-sm">
            {offer.rewardType === 'percentage' ? `${offer.rewardValue}% OFF` : `₹${offer.rewardValue} OFF`}
          </div>
        </div>
        
        <p className="text-gray-600 mb-3">{offer.description}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <span>Valid till {formatDate(offer.endDate)}</span>
        </div>
        
        {offer.couponCode && (
          <div className="mt-2 bg-white border border-purple-200 rounded p-2 flex justify-between items-center">
            <div>
              <span className="text-xs text-gray-500">Use code:</span>
              <span className="ml-2 font-mono font-bold">{offer.couponCode}</span>
            </div>
            <button className="text-purple-500 text-sm font-medium">Copy</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Special Offers</h1>
        <p className="text-gray-600">Discover amazing deals and discounts on our products</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Product Offers Section */}
          {offers.productOffers.length > 0 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaTag className="mr-2 text-orange-500" />
                Product Offers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offers.productOffers.map((offer) => (
                  <div key={offer._id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    {offer.product && offer.product.images && offer.product.images[0] && (
                      <div className="h-48 overflow-hidden relative">
                        <img 
                          src={getImageUrl(offer.product.images[0])} 
                          alt={offer.product.name} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-0 left-0 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-br-md">
                          {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                        </div>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-medium text-lg mb-1">{offer.product ? offer.product.name : 'Product'}</h3>
                      <p className="text-gray-600 text-sm mb-3">{offer.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Valid till {formatDate(offer.endDate)}</span>
                        <Link 
                          to={`/products/${offer.product?._id}`} 
                          className="flex items-center text-orange-500 hover:text-orange-600 text-sm font-medium"
                        >
                          View Product <FaArrowRight className="ml-1" size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Offers Section */}
          {offers.categoryOffers.length > 0 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaPercent className="mr-2 text-indigo-500" />
                Category Offers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offers.categoryOffers.map((offer) => (
                  <div key={offer._id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4">
                      <h3 className="font-medium text-lg mb-1">{offer.category ? offer.category.name : 'Category'}</h3>
                      <p className="text-gray-600 text-sm mb-3">{offer.description}</p>
                      <div className="bg-indigo-100 text-indigo-800 font-medium px-3 py-2 rounded-md mb-3">
                        {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Valid till {formatDate(offer.endDate)}</span>
                        <Link 
                          to={`/products?category=${offer.category?.name}`} 
                          className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium"
                        >
                          Browse Products <FaArrowRight className="ml-1" size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Referral Offers Section */}
          {offers.referralOffers.length > 0 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaGift className="mr-2 text-purple-500" />
                Referral Offers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offers.referralOffers.map((offer) => (
                  <div key={offer._id}>
                    <ReferralOfferCard offer={offer} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Offers Message */}
          {offers.productOffers.length === 0 && offers.categoryOffers.length === 0 && offers.referralOffers.length === 0 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
              <h3 className="text-xl font-medium mb-2">No Active Offers</h3>
              <p className="text-gray-600">
                Check back later for exciting deals and discounts!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Offers;
