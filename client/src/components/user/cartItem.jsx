import React from "react";
import { useDispatch } from "react-redux";
import { updateCartItem, removeFromCart } from "../../features/cart/cartSlice";

const CartItem = ({ item }) => {
  const dispatch = useDispatch();

  // Get the product and size info
  const product = item.product;
  const size = item.size;

  // Find the size object to get stock information
  const sizeObj = product.sizes.find((s) => s.size === size);
  const maxStock = sizeObj ? sizeObj.stock : 0;

  // Check if product is out of stock
  const isOutOfStock = maxStock === 0;

  // Handle quantity change
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      dispatch(
        updateCartItem({
          itemId: item._id,
          quantity: newQuantity,
        })
      );
    }
  };

  // Handle remove item
  const handleRemove = () => {
    dispatch(removeFromCart(item._id));
  };

  return (
    <div
      className={`border rounded-lg p-4 mb-4 ${
        isOutOfStock ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start">
        {/* Product Image */}
        <div className="w-24 h-24 flex-shrink-0 mr-4 overflow-hidden rounded-md">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="flex-grow">
          <h3 className="text-lg font-medium text-gray-800">{product.name}</h3>
          <p className="text-sm text-gray-500">Size: {size}</p>
          <p className="text-md font-semibold mt-1">₹{product.price}</p>

          {isOutOfStock ? (
            <p className="text-red-500 text-sm mt-2">Out of stock</p>
          ) : (
            <div className="flex items-center mt-2">
              <button
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="px-2 py-1 border rounded-l-md bg-gray-100 disabled:opacity-50"
              >
                -
              </button>
              <span className="px-4 py-1 border-t border-b">
                {item.quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={item.quantity >= maxStock}
                className="px-2 py-1 border rounded-r-md bg-gray-100 disabled:opacity-50"
              >
                +
              </button>

              <span className="ml-4 text-sm text-gray-500">
                {maxStock} available
              </span>
            </div>
          )}

          <div className="mt-3">
            <button
              onClick={handleRemove}
              className="text-red-600 text-sm font-medium hover:text-red-800"
            >
              Remove
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="ml-4 text-right">
          <p className="text-lg font-bold">₹{product.price * item.quantity}</p>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
