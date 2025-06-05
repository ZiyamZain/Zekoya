import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSalesReport, downloadReport } from '../../features/report/reportSlice';
import { format } from 'date-fns';
import { FaFileDownload, FaSearch, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

const SalesReportPage = () => {
  const dispatch = useDispatch();
  const salesReport = useSelector((state) => state.report.salesReport);
  const data = useMemo(() => salesReport?.data || { orders: [], pagination: { total: 0, totalPages: 1 } }, [salesReport]);
  const isLoading = salesReport?.isLoading || false;
  const downloadStatus = useSelector((state) => state.report.downloadStatus);
  const isDownloading = downloadStatus?.isLoading || false;

  // Filter states
  const [filterType, setFilterType] = useState('monthly'); // custom, daily, weekly, monthly, yearly
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const limit = 7; // Matches the backend limit

  // Load initial data when component mounts
  useEffect(() => {
    // Set default date range to current month
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const formattedStartDate = format(firstDayOfMonth, 'yyyy-MM-dd');
    const formattedEndDate = format(today, 'yyyy-MM-dd');
    
    setStartDate(formattedStartDate);
    setEndDate(formattedEndDate);
    
    // Fetch report with default monthly filter
    const filters = {
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    };
    dispatch(getSalesReport(filters))
      .unwrap()
      .then(response => {
     
        if (response.data && response.data.orders) {
          // Orders data exists, no specific action needed here based on length alone for now
        } else {
          console.error('No orders data found in response');
        }
      })
      .catch(error => console.error('Error fetching sales report:', error));
  }, [dispatch]);

  // Update pagination when data changes
  useEffect(() => {
    if (data) {
    
      setTotalPages(data.pagination?.totalPages || data.pagination?.pages || 1);
      setTotalOrders(data.pagination?.total || 0);
      // Update current page if it's out of bounds
      if (currentPage > (data.pagination?.totalPages || data.pagination?.pages || 1)) {
        setCurrentPage(1);
      }
    }
  }, [data, currentPage]);

  // Summary states
  const [, setSummary] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalDiscount: 0,
    averageOrderValue: 0,
  });

  useEffect(() => {
    if (data && data.summary) {
      setSummary({
        totalOrders: data.summary.totalOrders || 0,
        totalRevenue: data.summary.totalRevenue || 0,
        totalDiscount: data.summary.totalDiscount || 0,
        averageOrderValue: data.summary.averageOrderValue || 0,
      });
    }
  }, [data]);

  const handleFilterChange = (type) => {
    setFilterType(type);
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (type) {
      case 'daily':
        start = format(today, 'yyyy-MM-dd');
        end = format(today, 'yyyy-MM-dd');
        break;
      case 'weekly':
        start = format(new Date(today.setDate(today.getDate() - 7)), 'yyyy-MM-dd');
        end = format(new Date(), 'yyyy-MM-dd');
        break;
      case 'monthly':
        start = format(new Date(today.setMonth(today.getMonth() - 1)), 'yyyy-MM-dd');
        end = format(new Date(), 'yyyy-MM-dd');
        break;
      case 'yearly':
        start = format(new Date(today.setFullYear(today.getFullYear() - 1)), 'yyyy-MM-dd');
        end = format(new Date(), 'yyyy-MM-dd');
        break;
      default:
        return;
    }

    setStartDate(start);
    setEndDate(end);
    fetchReport(start, end, 1, false, true);
  };

  const fetchReport = (start, end, page = 1, isPageChange = false, isPeriodChange = false) => {
    // Validate dates
    if (!start || !end) {
      toast.error('Please select both start and end dates');
      return;
    }
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (startDate > endDate) {
      toast.error('Start date cannot be after end date');
      return;
    }
    
    const filters = {
      startDate: start,
      endDate: end,
      page,
      limit
    };
    
    
    
    dispatch(getSalesReport(filters))
      .unwrap()
      .then((response) => {

        if (response.data && response.data.orders) {
          // Orders data exists, no specific action needed here for now
        } else {
          console.warn('No orders data in response:', response);
        }
        
        if (!isPageChange && !isPeriodChange) {
          toast.success('Report generated successfully');
        }
      })
      .catch((error) => {
        console.error('Error fetching report:', error);
        toast.error(error || 'Failed to generate report');
      });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    fetchReport(startDate, endDate, newPage, true);
  };

  const handleDownload = async (format) => {
    try {
      const filters = {
        startDate,
        endDate,
      };
      await dispatch(downloadReport({ filters, format })).unwrap();
      toast.success(`Report downloaded successfully in ${format.toUpperCase()} format`);
    } catch { // _error removed as it's not used
      toast.error('Failed to download report');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">Sales Report</h1>
        
        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={() => handleFilterChange('daily')}
              className={`px-4 py-2 rounded ${
                filterType === 'daily'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => handleFilterChange('weekly')}
              className={`px-4 py-2 rounded ${
                filterType === 'weekly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => handleFilterChange('monthly')}
              className={`px-4 py-2 rounded ${
                filterType === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => handleFilterChange('yearly')}
              className={`px-4 py-2 rounded ${
                filterType === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Yearly
            </button>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded px-3 py-2"
              />
            </div>
            <button
              onClick={() => fetchReport(startDate, endDate)}
              className={`flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
                (!startDate || !endDate) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!startDate || !endDate || isLoading}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <FaSearch className="mr-2" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {!isLoading && data && data.summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total Orders</h3>
              <p className="text-3xl font-bold text-blue-600">
                {data.summary.totalOrders}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-green-600">
                ₹{data.summary.totalRevenue?.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total Discount</h3>
              <p className="text-3xl font-bold text-red-600">
                ₹{data.summary.totalDiscount?.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Average Order Value</h3>
              <p className="text-3xl font-bold text-purple-600">
                ₹{data.summary.averageOrderValue?.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Download Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => handleDownload('pdf')}
            disabled={isDownloading || !data}
            className="flex items-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
          >
            <FaFileDownload className="mr-2" />
            Download PDF
          </button>
          <button
            onClick={() => handleDownload('excel')}
            disabled={isDownloading || !data}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            <FaFileDownload className="mr-2" />
            Download Excel
          </button>
        </div>

        {/* Sales Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-4xl text-blue-600" />
          </div>
        ) : data?.orders ? (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
               
                    {isLoading ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center">
                          <div className="flex justify-center">
                            <FaSpinner className="animate-spin h-5 w-5 text-blue-500" />
                          </div>
                        </td>
                      </tr>
                    ) : data?.orders?.length > 0 ? (
                      data.orders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.orderId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{order.user?.name || 'Guest'}</div>
                            <div className="text-sm text-gray-500">{order.user?.email || ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{order.itemCount || 0} items</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.paymentMethod === 'cod' ? 'bg-yellow-100 text-yellow-800' :
                              order.paymentMethod === 'razorpay' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.paymentMethod?.toUpperCase() || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              order.orderStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.orderStatus?.toUpperCase() || 'PENDING'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{order.totalPrice?.toFixed(2) || '0.00'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                          {data?.orders ? 'No orders found for the selected period' : 'Error loading orders'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-b-lg shadow">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * limit, totalOrders)}
                    </span>{' '}
                    of <span className="font-medium">{totalOrders}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      &larr;
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Calculate page numbers to show (current page in the middle when possible)
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      if (pageNum < 1 || pageNum > totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      &rarr;
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No sales data available for the selected period</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesReportPage;
