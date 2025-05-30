import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getDashboardStats, getBestSellers, getPaymentStats } from '../../features/report/reportSlice';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { 
  FaSpinner, 
  FaShoppingBag, 
  FaBox, 
  FaTags, 
  FaMoneyBillWave, 
  FaChartPie, 
  FaFileAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    dashboardStats, 
    bestSellers, 
    paymentStats: paymentStatsState 
  } = useSelector((state) => state.report);
  
  const { adminInfo } = useSelector((state) => state.adminAuth);
  
  // Extract data from the Redux state
  const dashboardData = dashboardStats?.data || {};
  const isLoading = dashboardStats?.loading || false;
  const error = dashboardStats?.error || null;
  
  const [timeFilter, setTimeFilter] = useState('yearly');
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Sales',
      data: [],
      borderColor: 'rgba(79, 70, 229, 1)',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      tension: 0.3,
      fill: true,
    }]
  });
  
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Handle view sales report button click
  const handleViewSalesReport = () => {
    navigate('/admin/sales-report');
  };

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.debug('Dashboard data loaded:', { dashboardData, bestSellers, paymentStatsState });
    }
  }, [dashboardData, bestSellers, paymentStatsState]);

  useEffect(() => {
    // Only fetch data if admin is logged in
    if (!adminInfo || !adminInfo.token) {
      console.error('Admin not authenticated');
      return;
    }

    // Fetch dashboard data when component mounts or timeFilter changes
    const fetchDashboardData = async () => {
      try {
        await Promise.all([
          dispatch(getDashboardStats(timeFilter)),
          dispatch(getBestSellers({ category: 'products', limit: 5 })),
          dispatch(getBestSellers({ category: 'categories', limit: 5 })),
          dispatch(getPaymentStats())
        ]);
        
  
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setInitialLoad(false);
      }
    };

    fetchDashboardData();
  }, [dispatch, timeFilter, adminInfo]);

  // Update chart data when dashboard data changes
  useEffect(() => {
    if (dashboardData?.data?.salesData?.length > 0) {
      const salesData = Array.isArray(dashboardData.data.salesData) 
        ? dashboardData.data.salesData 
        : [];
      

      
      const labels = salesData.map((item) => item.date || item._id || 'N/A');
      const amounts = salesData.map((item) => item.amount || item.total || 0);
      
      setChartData({
        labels,
        datasets: [
          {
            label: 'Sales',
            data: amounts,
            borderColor: 'rgba(79, 70, 229, 1)',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            tension: 0.3,
            fill: true,
          },
        ],
      });
    } else {

      // Set default empty chart data
      setChartData({
        labels: ['No Data'],
        datasets: [
          {
            label: 'Sales',
            data: [0],
            borderColor: 'rgba(79, 70, 229, 1)',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            tension: 0.3,
            fill: true,
          },
        ],
      });
    }
  }, [dashboardData]);

  // Process payment statistics to ensure consistent data structure
  const processPaymentStats = useMemo(() => {
    if (!paymentStatsState?.data) return [];
    
    try {
      // If data is already an array, return it directly
      if (Array.isArray(paymentStatsState.data)) {
        return paymentStatsState.data;
      }
      
      // If data is an object, convert it to array format
      if (typeof paymentStatsState.data === 'object' && paymentStatsState.data !== null) {
        return Object.entries(paymentStatsState.data).map(([key, value]) => ({
          _id: key,
          ...(typeof value === 'object' ? value : { count: value, total: value })
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error processing payment stats:', error);
      return [];
    }
  }, [paymentStatsState]);

  // Process best sellers to ensure consistent data structure
  const processBestSellers = useMemo(() => {
    if (!bestSellers?.data) return { products: [], categories: [] };
    
    try {
      const result = { products: [], categories: [] };
      const data = bestSellers.data;
      
      // Handle products
      if (data.products || data.products === 0) {
        result.products = Array.isArray(data.products) 
          ? data.products 
          : [data.products];
      }
      
      // Handle categories
      if (data.categories || data.categories === 0) {
        result.categories = Array.isArray(data.categories)
          ? data.categories
          : [data.categories];
      }
      
      return result;
    } catch (error) {
      console.error('Error processing best sellers:', error);
      return { products: [], categories: [] };
    }
  }, [bestSellers]);

  // Payment chart data
  const paymentChartData = useMemo(() => {
    if (!processPaymentStats || processPaymentStats.length === 0) {
      return {
        labels: ['No data'],
        datasets: [{
          data: [1],
          backgroundColor: ['#E5E7EB'],
          hoverBackgroundColor: ['#D1D5DB']
        }]
      };
    }
    
    return {
      labels: processPaymentStats.map(item => {
        if (!item) return 'Unknown';
        return item._id || item.paymentMethod || 'Unknown';
      }),
      datasets: [
        {
          data: processPaymentStats.map(item => item?.count || item?.total || 0),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
          ],
          hoverBackgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
          ],
        },
      ],
    };
  }, [processPaymentStats]);

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sales Overview',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Sales Amount (₹)',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Number of Orders',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const paymentChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Payment Methods Distribution',
      },
    },
  };

  // Render top selling products
  const renderTopProducts = () => {
    const productsData = bestSellers?.data?.products || [];
    const isLoading = bestSellers?.loading || false;
    
  
    
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-32">
          <FaSpinner className="animate-spin text-2xl text-blue-600" />
        </div>
      );
    }
    
    if (!productsData || productsData.length === 0) {
      return <div className="text-center py-4">No product data available</div>;
    }
    
    return (
      <div className="space-y-4">
        {productsData.map((product, index) => (
          <div key={product._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <span className="font-medium text-gray-700 w-6">{index + 1}.</span>
              <div className="ml-2">
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-500">{product.totalSold || 0} sold</p>
              </div>
            </div>
            <span className="font-semibold">₹{(product.totalRevenue || 0).toFixed(2)}</span>
          </div>
        ))}
      </div>
    );
  };
  
  // Render top categories
  const renderTopCategories = () => {
    const categoriesData = bestSellers?.data?.categories || [];
    const isLoading = bestSellers?.loading || false;
    

    
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-32">
          <FaSpinner className="animate-spin text-2xl text-blue-600" />
        </div>
      );
    }
    
    if (!categoriesData || categoriesData.length === 0) {
      return <div className="text-center py-4">No category data available</div>;
    }
    
    return (
      <div className="space-y-4">
        {categoriesData.map((category, index) => (
          <div key={category._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <span className="font-medium text-gray-700 w-6">{index + 1}.</span>
              <div className="ml-2">
                <p className="font-medium capitalize">{category.name}</p>
                <p className="text-sm text-gray-500">{category.totalSold || 0} items sold</p>
              </div>
            </div>
            <span className="font-semibold">₹{(category.totalRevenue || 0).toFixed(2)}</span>
          </div>
        ))}
      </div>
    );
  };

  // Show loading state only when initial data is being fetched
  if (initialLoad) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
        <span className="mt-4 text-gray-600">Loading dashboard data...</span>
      </div>
    );
  }
  
  // Show error message if there was an error
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">
            {error.message || 'Failed to load dashboard data. Please try again.'}
          </span>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If no data is available
  if (!dashboardData || Object.keys(dashboardData).length === 0) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          <strong className="font-bold">No data available</strong>
          <span className="block sm:inline"> No dashboard data found. Please check back later or contact support.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleViewSalesReport}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FaFileAlt className="mr-2" />
            View Sales Report
          </button>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="daily">Today</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
            <option value="yearly">This Year</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Sales</h3>
          <p className="text-3xl font-bold text-blue-600">
            ₹{dashboardData?.data?.totalSales?.toFixed(2) || '0.00'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-green-600">
            {dashboardData?.data?.totalOrders || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Average Order Value</h3>
          <p className="text-3xl font-bold text-purple-600">
            ₹{dashboardData?.data?.averageOrderValue?.toFixed(2) || '0.00'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Customers</h3>
          <p className="text-3xl font-bold text-orange-600">
            {dashboardData?.data?.totalCustomers || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Sales Overview</h2>
          <div className="h-64">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <FaSpinner className="animate-spin text-4xl text-blue-600" />
              </div>
            ) : chartData.labels.length > 0 ? (
              <Line 
                data={chartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `₹${value}`
                      }
                    }
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (context) => `Sales: ₹${context.raw}`
                      }
                    }
                  }
                }} 
              />
            ) : (
              <div className="flex justify-center items-center h-full text-gray-500">
                No sales data available for the selected period
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <FaChartPie className="text-blue-500 mr-2" />
            <h2 className="text-lg font-semibold">Payment Methods</h2>
          </div>
          {processPaymentStats.length > 0 ? (
            <Pie data={paymentChartData} options={paymentChartOptions} />
          ) : (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-2xl text-blue-500" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Selling Products */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <FaShoppingBag className="mr-2 text-blue-500" />
              Top 5 Selling Products
            </h2>
            <Link to="/admin/products" className="text-sm text-blue-600 hover:underline">View All</Link>
          </div>
          {renderTopProducts()}
        </div>

        {/* Top 5 Categories */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <FaTags className="mr-2 text-green-500" />
              Top 5 Categories
            </h2>
            <Link to="/admin/categories" className="text-sm text-blue-600 hover:underline">View All</Link>
          </div>
          {renderTopCategories()}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
