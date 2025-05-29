import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MdFileDownload } from 'react-icons/md';
import { getSalesReport, exportSalesReport } from '../../features/report/reportSlice';
import Spinner from '../../components/Spinner';

const SalesReport = () => {
  const dispatch = useDispatch();
  const { isLoading, salesReport } = useSelector((state) => state.report);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleGenerateReport = (e) => {
    e.preventDefault();
    dispatch(getSalesReport({ startDate, endDate }));
  };

  const handleExportExcel = () => {
    dispatch(exportSalesReport({ startDate, endDate }));
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Sales Report</h2>
        
        {/* Date Range Form */}
        <form onSubmit={handleGenerateReport} className="flex gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Generate Report
            </button>
          </div>
        </form>

        {/* Report Results */}
        {salesReport && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-semibold">{salesReport.totalOrders}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold">
                  ₹{salesReport.totalRevenue?.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center justify-center w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  <MdFileDownload className="mr-2" size={20} />
                  Export to Excel
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Items
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {salesReport.orders?.map((order) => (
                    <tr key={order.orderId}>
                      <td className="px-4 py-3 text-sm">{order.orderId}</td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(order.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">{order.customer}</td>
                      <td className="px-4 py-3 text-sm">{order.items}</td>
                      <td className="px-4 py-3 text-sm">
                        ₹{order.total.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            order.status === 'Delivered'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'Processing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesReport;
