import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  getWishlist,
  resetWishlist,
} from "../../features/wishlist/wishlistSlice";
import WishlistItemNew from "../../components/user/WishlistItemNew";

const Wishlist = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.userAuth);
  const { wishlist, isLoading, isError, message } = useSelector(
    (state) => state.wishlist
  );

  useEffect(() => {
    if (userInfo) {
      dispatch(getWishlist());
    }

    return () => {
      dispatch(resetWishlist());
    };
  }, [dispatch, userInfo]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Your Wishlist</h1>

        {isError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{message}</p>
          </div>
        )}

        {!wishlist || !wishlist.products || wishlist.products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-4">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Save items you like by clicking the heart icon on product pages.
            </p>
            <Link
              to="/products"
              className="inline-block bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.products.map((product) => (
              <WishlistItemNew key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
