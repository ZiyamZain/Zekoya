import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  MdPeople,
  MdShoppingCart,
  MdAttachMoney,
  MdPendingActions,
  MdBarChart,
  MdArrowForward,
} from "react-icons/md";
import { FaFileAlt } from "react-icons/fa";
import { getDashboardStats } from "../../features/report/reportSlice";
import Spinner from "../../components/Spinner";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { adminInfo } = useSelector((state) => state.adminAuth);
  const { reports, isLoading } = useSelector((state) => state.report);
  
  const [stats, setStats] = useState([
    { label: "Total Users", value: "--", icon: <MdPeople size={24} /> },
    { label: "Items Sold", value: "--", icon: <MdShoppingCart size={24} /> },
    {
      label: "Total Sales",
      value: "₹--",
      icon: <MdAttachMoney size={24} />,
    },
    {
      label: "Pending Orders",
      value: "--",
      icon: <MdPendingActions size={24} />,
    },
  ]);
  
  // Recent orders to populate the table
  const [recentOrders, setRecentOrders] = useState([]);
  
  useEffect(() => {
    if (adminInfo) {
      dispatch(getDashboardStats());
    }
  }, [dispatch, adminInfo]);
  
  useEffect(() => {
    if (reports?.stats) {
      const { today, week, month, recentOrders } = reports.stats;
      
      setStats([
        { label: "Total Users", value: reports.stats.userCount || "--", icon: <MdPeople size={24} /> },
        { label: "Monthly Orders", value: month?.orders || "--", icon: <MdShoppingCart size={24} /> },
        {
          label: "Monthly Revenue",
          value: `₹${month?.revenue?.toFixed(2) || "--"}`,
          icon: <MdAttachMoney size={24} />,
        },
        {
          label: "Pending Orders",
          value: reports.stats.pendingOrders || "--",
          icon: <MdPendingActions size={24} />,
        },
      ]);
      
      setRecentOrders(recentOrders || []);
    }
  }, [reports]);

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
        <Link
          to="/admin/sales-report"
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <MdBarChart className="mr-2" />
          View Sales Report
        </Link>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Spinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between transition-all duration-200 hover:shadow-lg"
            >
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">{stat.icon}</div>
            </div>
          ))}
        </div>
      )}
      
      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
            <p className="text-sm text-gray-500 mt-1">Latest transactions</p>
          </div>
          <Link
            to="/admin/orders"
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View All <MdArrowForward className="ml-1" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Spinner />
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Order ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderId || `#${order._id.substring(order._id.length - 6)}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.user?.name || 'Guest'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{order.totalPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}
                        >
                          {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link
                          to={`/admin/orders/${order._id}`} // Keep using _id for the link as the route likely expects the MongoDB ID
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FaFileAlt />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No recent orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
