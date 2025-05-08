import React from "react";
import { useDispatch } from "react-redux";
import { removeFromWishlist } from "../../features/wishlist/wishlistSlice";
import { addToCart } from "../../features/cart/cartSlice";

const WishlistItemNew = ({ product }) => {
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
        price: product.price,
        name: product.name,
        image: product.images[0],
      })
    );
  };

  // Handle remove from wishlist
  const handleRemoveFromWishlist = () => {
    dispatch(removeFromWishlist(product._id));
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
      <div className="flex flex-col md:flex-row">
        {/* Product Image */}
        <div className="md:w-1/3 p-4">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-48 object-cover rounded-md"
          />
        </div>

        {/* Product Details */}
        <div className="md:w-2/3 p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {product.name}
            </h3>
            <p className="text-gray-600 mb-2">{product.description}</p>
            <p className="text-indigo-600 font-bold mb-2">₹{product.price}</p>

            {/* Available Sizes */}
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">Available Sizes:</p>
              <div className="flex flex-wrap gap-2">
                {hasStock ? (
                  availableSizes.map((size) => (
                    <button
                      key={size._id}
                      onClick={() => handleAddToCart(size.size)}
                      className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition"
                    >
                      {size.size} ({size.stock})
                    </button>
                  ))
                ) : (
                  <span className="text-red-500 text-sm">Out of Stock</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              onClick={handleRemoveFromWishlist}
              className="px-4 py-2 text-sm bg-red-100 text-red-600 hover:bg-red-200 rounded-md transition"
            >
              Remove from Wishlist
            </button>
            {hasStock && (
              <button
                onClick={() => handleAddToCart(availableSizes[0].size)}
                className="px-4 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded-md transition"
              >
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistItemNew;
