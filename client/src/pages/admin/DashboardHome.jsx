import React from "react";
import {
  MdPeople,
  MdShoppingCart,
  MdAttachMoney,
  MdPendingActions,
} from "react-icons/md";

const Dashboard = () => {
  const stats = [
    { label: "Total Users", value: "29", icon: <MdPeople size={24} /> },
    { label: "Items Sold", value: "19", icon: <MdShoppingCart size={24} /> },
    {
      label: "Total Sales",
      value: "₹999,156",
      icon: <MdAttachMoney size={24} />,
    },
    {
      label: "Pending Orders",
      value: "12",
      icon: <MdPendingActions size={24} />,
    },
  ];

  // Placeholder product data to populate the table
  const products = [
  
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-black">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of your store's performance
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between transition-all duration-200 hover:shadow-lg"
          >
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stat.value}
              </p>
            </div>
            <div className="text-gray-400 group-hover:text-gray-600">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Top Sold Products</h2>
        </div>

        {products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No products found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty Sold
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product, index) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-md border border-gray-200"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.brand}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.amount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.revenue}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.qty}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {products.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{products.length}</span> of{" "}
              <span className="font-medium">10</span> products
            </div>
            <div className="flex space-x-2">
              <button
                disabled={true}
                className="px-3 py-1 rounded-md bg-gray-200 text-gray-400 cursor-not-allowed"
              >
                Previous
              </button>
              <button className="px-3 py-1 rounded-md bg-gradient-to-r from-red-500 to-orange-400 text-white">
                1
              </button>
              <button className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border border-gray-300">
                2
              </button>
              <button className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border border-gray-300">
                3
              </button>
              <button className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border border-gray-300">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
