import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaFileExcel, FaFilePdf, FaSearch, FaFilter, FaCalendarAlt, FaChartPie, FaChartBar } from 'react-icons/fa';
import { format, subDays, subWeeks, subMonths, parseISO } from 'date-fns';
import { getSalesReport } from '../../features/report/reportSlice';
import Spinner from '../../components/Spinner';
import { toast } from 'react-toastify';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import * as XLSX from 'xlsx';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Initialize pdfMake with fonts
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

const SalesReportPage = () => {
  const dispatch = useDispatch();
  const { reports, isLoading, isError, message } = useSelector((state) => state.report);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState('custom');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Set default dates to current date
    const today = new Date();
    setEndDate(format(today, 'yyyy-MM-dd'));
    setStartDate(format(subDays(today, 7), 'yyyy-MM-dd'));
    
    // Load initial report data
    const reportParams = {
      startDate: format(subDays(today, 7), 'yyyy-MM-dd'),
      endDate: format(today, 'yyyy-MM-dd'),
    };
    dispatch(getSalesReport(reportParams));
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
  }, [isError, message]);

  // useEffect for any future report data processing if needed
  // useEffect(() => {
  //   if (reports) {
  //     // Process report data if needed
  //   }
  // }, [reports]);

  const handleFilterChange = (type) => {
    const today = new Date();
    let start = today;
    
    switch(type) {
      case 'day':
        start = subDays(today, 1);
        break;
      case 'week':
        start = subWeeks(today, 1);
        break;
      case 'month':
        start = subMonths(today, 1);
        break;
      default:
        // Keep custom dates
        setFilterType('custom');
        return;
    }
    
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(today, 'yyyy-MM-dd'));
    setFilterType(type);
    
    dispatch(getSalesReport({
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(today, 'yyyy-MM-dd'),
    }));
  };

  const handleSubmitFilter = (e) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date cannot be after end date');
      return;
    }
    
    dispatch(getSalesReport({ startDate, endDate }));
  };

  const exportToPDF = () => {
    try {
      // Create table body data
      const tableBody = [];
      
      // Add header row
      tableBody.push([
        { text: 'Order ID', style: 'tableHeader' },
        { text: 'Date', style: 'tableHeader' },
        { text: 'Customer', style: 'tableHeader' },
        { text: 'Amount', style: 'tableHeader' },
        { text: 'Discount', style: 'tableHeader' },
        { text: 'Payment Method', style: 'tableHeader' }
      ]);
      
      // Add data rows
      reports?.orders?.forEach(order => {
        tableBody.push([
          // Use the custom orderId if available (like ZK-123456)
          order.orderId || (typeof order._id === 'string' ? order._id : order._id?.toString()),
          format(new Date(order.createdAt), 'dd/MM/yyyy'),
          order.user?.name || 'Guest',
          `₹${order.totalPrice.toFixed(2)}`,
          `₹${(order.couponDiscount || 0).toFixed(2)}`,
          order.paymentMethod
        ]);
      });
      
      // Define the document definition
      const docDefinition = {
        content: [
          { text: 'Zekoya Sales Report', style: 'header' },
          { text: `Period: ${format(new Date(startDate), 'dd/MM/yyyy')} - ${format(new Date(endDate), 'dd/MM/yyyy')}`, style: 'subheader' },
          { text: ' ', margin: [0, 10] }, // Spacer
          {
            columns: [
              {
                width: '33%',
                text: `Total Orders: ${reports?.summary?.totalOrders || 0}`
              },
              {
                width: '33%',
                text: `Total Revenue: ₹${reports?.summary?.totalRevenue?.toFixed(2) || 0}`
              },
              {
                width: '33%',
                text: `Total Discount: ₹${reports?.summary?.totalDiscount?.toFixed(2) || 0}`
              }
            ],
            margin: [0, 0, 0, 20]
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto'],
              body: tableBody
            },
            layout: {
              fillColor: function(rowIndex) {
                return (rowIndex === 0) ? '#CCCCCC' : null;
              }
            }
          }
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 10]
          },
          subheader: {
            fontSize: 14,
            bold: true,
            margin: [0, 10, 0, 5]
          },
          tableHeader: {
            bold: true,
            fontSize: 12,
            color: 'black'
          }
        },
        defaultStyle: {
          fontSize: 10
        }
      };
      
      // Generate and download the PDF
      pdfMake.createPdf(docDefinition).download(`Zekoya_Sales_Report_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
      toast.success('PDF report downloaded successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to generate PDF report');
    }
  };

  const exportToExcel = () => {
    try {
      if (!reports || !reports.orders) {
        toast.error('No report data available');
        return;
      }
      
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Create summary worksheet
      const summaryData = [
        ['Zekoya Sales Report'],
        [`Period: ${format(new Date(startDate), 'dd/MM/yyyy')} - ${format(new Date(endDate), 'dd/MM/yyyy')}`],
        [],
        ['Summary Statistics'],
        ['Total Orders', reports.summary?.totalOrders || 0],
        ['Total Revenue', `₹${(reports.summary?.totalRevenue || 0).toFixed(2)}`],
        ['Total Discount', `₹${(reports.summary?.totalDiscount || 0).toFixed(2)}`],
        []
      ];
      
      // Add payment method breakdown if available
      if (reports.summary?.paymentMethodCounts) {
        summaryData.push(['Payment Method Breakdown']);
        summaryData.push(['Method', 'Count', 'Percentage']);
        
        Object.entries(reports.summary.paymentMethodCounts).forEach(([method, count]) => {
          const percentage = (count / reports.summary.totalOrders * 100).toFixed(2);
          summaryData.push([method, count, `${percentage}%`]);
        });
      }
      
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
      
      // Create orders worksheet
      const ordersData = [
        ['Order ID', 'Date', 'Customer', 'Amount', 'Discount', 'Payment Method', 'Status']
      ];
      
      reports.orders.forEach(order => {
        ordersData.push([
          order.orderId || (typeof order._id === 'string' ? order._id : order._id?.toString()),
          format(new Date(order.createdAt), 'dd/MM/yyyy'),
          order.user?.name || 'Guest',
          order.totalPrice.toFixed(2),
          (order.couponDiscount || 0).toFixed(2),
          order.paymentMethod,
          order.orderStatus || order.status || 'Unknown'
        ]);
      });
      
      const ordersWs = XLSX.utils.aoa_to_sheet(ordersData);
      XLSX.utils.book_append_sheet(wb, ordersWs, 'Orders');
      
      // Create daily sales worksheet if available
      if (reports.dailySales && reports.dailySales.length > 0) {
        const dailyData = [
          ['Date', 'Orders', 'Revenue', 'Discount', 'Net Revenue']
        ];
        
        reports.dailySales.forEach(day => {
          dailyData.push([
            day.date,
            day.count,
            day.revenue.toFixed(2),
            day.discount.toFixed(2),
            (day.revenue - day.discount).toFixed(2)
          ]);
        });
        
        const dailyWs = XLSX.utils.aoa_to_sheet(dailyData);
        XLSX.utils.book_append_sheet(wb, dailyWs, 'Daily Sales');
      }
      
      // Create category sales worksheet if available
      if (reports.categorySales && reports.categorySales.length > 0) {
        const categoryData = [
          ['Category', 'Items Sold', 'Revenue']
        ];
        
        reports.categorySales.forEach(cat => {
          categoryData.push([
            cat.category,
            cat.count,
            cat.revenue.toFixed(2)
          ]);
        });
        
        const categoryWs = XLSX.utils.aoa_to_sheet(categoryData);
        XLSX.utils.book_append_sheet(wb, categoryWs, 'Category Sales');
      }
      
      // Generate Excel file
      XLSX.writeFile(wb, `Zekoya_Sales_Report_${startDate}_to_${endDate}.xlsx`);
      
      toast.success('Excel report downloaded successfully');
    } catch (error) {
      console.error('Error generating Excel report:', error);
      toast.error('Failed to generate Excel report');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sales Report</h1>
        <div className="flex space-x-2">
          <button
            onClick={exportToExcel}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            disabled={isLoading || !reports}
          >
            <FaFileExcel className="mr-2" />
            Excel
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            disabled={isLoading || !reports}
          >
            <FaFilePdf className="mr-2" />
            PDF
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <FaFilter className="mr-2" />
            Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap items-center mb-4">
            <button
              onClick={() => handleFilterChange('day')}
              className={`mr-2 mb-2 px-4 py-2 rounded-md ${
                filterType === 'day' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handleFilterChange('week')}
              className={`mr-2 mb-2 px-4 py-2 rounded-md ${
                filterType === 'week' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => handleFilterChange('month')}
              className={`mr-2 mb-2 px-4 py-2 rounded-md ${
                filterType === 'month' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              This Month
            </button>
          </div>
          
          <form onSubmit={handleSubmitFilter} className="flex flex-wrap items-end">
            <div className="mr-4 mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaCalendarAlt className="inline mr-1" /> Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded-md px-3 py-2"
              />
            </div>
            <div className="mr-4 mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaCalendarAlt className="inline mr-1" /> End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded-md px-3 py-2"
              />
            </div>
            <button
              type="submit"
              className="mb-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <FaSearch className="inline mr-1" /> Apply Filter
            </button>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center my-12">
          <Spinner />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Orders</h3>
              <p className="text-3xl font-bold text-indigo-600">{reports?.summary?.totalOrders || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-green-600">₹{reports?.summary?.totalRevenue?.toFixed(2) || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Discount</h3>
              <p className="text-3xl font-bold text-orange-600">₹{reports?.summary?.totalDiscount?.toFixed(2) || 0}</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Payment Method Pie Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <FaChartPie className="mr-2 text-indigo-600" />
                Payment Method Distribution
              </h3>
              {reports?.summary?.paymentMethodCounts && Object.keys(reports.summary.paymentMethodCounts).length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(reports.summary.paymentMethodCounts).map(([name, value], index) => ({
                          name,
                          value,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {Object.keys(reports.summary.paymentMethodCounts).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 text-gray-500">
                  No payment data available for the selected period
                </div>
              )}
            </div>

            {/* Daily Sales Bar Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <FaChartBar className="mr-2 text-indigo-600" />
                Daily Sales
              </h3>
              {reports?.dailySales && Object.keys(reports.dailySales).length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reports.dailySales.map(day => ({
                        date: format(new Date(day.date), 'dd/MM'),
                        revenue: day.revenue,
                        orders: day.count
                      }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip formatter={(value, name) => [
                        name === 'revenue' ? `₹${value.toFixed(2)}` : value,
                        name === 'revenue' ? 'Revenue' : 'Orders'
                      ]} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="revenue" name="Revenue (₹)" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 text-gray-500">
                  No daily sales data available for the selected period
                </div>
              )}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports?.orders?.length > 0 ? (
                  reports.orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderId || order._id.substring(order._id.length - 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(order.createdAt), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.user?.name || 'Guest'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{order.totalPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{(order.couponDiscount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.paymentMethod}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No orders found for the selected period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesReportPage;
