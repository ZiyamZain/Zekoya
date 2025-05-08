import React from "react";
import { useDispatch } from "react-redux";
import { removeFromWishlist } from "../../features/wishlist/wishlistSlice";
import { addToCart } from "../../features/cart/cartSlice";

const WishlistItem = ({ product }) => {
  const dispatch = useDispatch();

  // Check if product has stock
  const hasStock = product.sizes.some((size) => size.stock > 0);

  // Get available sizes with stock
  const availableSizes = product.sizes.filter((size) => size.stock > 0);

  // Handle add to cart
  const handleAddToCart = (size) => {
    dispatch(
      addToCart({
        productId: product._id,
        size: size,
        quantity: 1,
      })
    );
  };

  // Handle remove from wishlist
  const handleRemove = () => {
    dispatch(removeFromWishlist(product._id));
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="relative">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-red-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-800 mb-1">
          {product.name}
        </h3>
        <p className="text-lg font-bold mb-3">₹{product.price}</p>

        {hasStock ? (
          <div>
            <p className="text-sm text-gray-600 mb-2">Available sizes:</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {availableSizes.map((size) => (
                <button
                  key={size.size}
                  onClick={() => handleAddToCart(size.size)}
                  className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  {size.size}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-red-500 text-sm mb-4">Out of stock</p>
        )}

        <button
          onClick={() => hasStock && handleAddToCart(availableSizes[0].size)}
          disabled={!hasStock}
          className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {hasStock ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
};

export default WishlistItem;
