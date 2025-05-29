import React from 'react';
import { FaBoxOpen, FaTag, FaTrademark } from 'react-icons/fa';

const TopItemsList = ({ title, items = [], type }) => {
  const getIcon = () => {
    switch (type) {
      case 'product':
        return <FaBoxOpen className="text-indigo-600" />;
      case 'category':
        return <FaTag className="text-green-600" />;
      case 'brand':
        return <FaTrademark className="text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="p-4">
        {items?.length > 0 ? (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={item._id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10">
                    <img
                      src={Array.isArray(item.image) ? item.image[0] : item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {`${item.totalQuantity.toLocaleString('en-IN')} units sold`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    ₹{item.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-gray-500">
                    Revenue
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center">No data available</p>
        )}
      </div>
    </div>
  );
};

export default TopItemsList;
