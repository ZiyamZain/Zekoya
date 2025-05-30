import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const SalesChart = ({ salesData, timeFilter }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!salesData || salesData.length === 0) return;

   

    // Add previous periods for comparison
    const formattedData = [];
    const currentData = salesData[0];

    if (timeFilter === 'daily') {
      // Show last 24 hours in 4-hour intervals
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setHours(date.getHours() - (i * 4));
        formattedData.push({
          date: date.toISOString(),
          revenue: i === 0 ? currentData.revenue : 0,
          orders: i === 0 ? currentData.orders : 0,
          label: date.toLocaleTimeString('en-IN', { hour: '2-digit', hour12: true })
        });
      }
    } else if (timeFilter === 'weekly') {
      // Show last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        formattedData.push({
          date: date.toISOString(),
          revenue: i === 0 ? currentData.revenue : 0,
          orders: i === 0 ? currentData.orders : 0,
          label: date.toLocaleDateString('en-IN', { weekday: 'short' })
        });
      }
    } else if (timeFilter === 'monthly') {
      // Show last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        formattedData.push({
          date: date.toISOString(),
          revenue: i === 0 ? currentData.revenue : 0,
          orders: i === 0 ? currentData.orders : 0,
          label: date.toLocaleString('en-IN', { month: 'short' })
        });
      }
    } else { // yearly
      // Show last 4 years
      for (let i = 3; i >= 0; i--) {
        const date = new Date();
        date.setFullYear(date.getFullYear() - i);
        formattedData.push({
          date: date.toISOString(),
          revenue: i === 0 ? currentData.revenue : 0,
          orders: i === 0 ? currentData.orders : 0,
          label: date.getFullYear().toString()
        });
      }
    }

    setChartData(formattedData);
  }, [salesData, timeFilter]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-md" style={{ height: '400px' }}>
        <h2 className="text-lg font-semibold mb-4">Sales Overview - {timeFilter}</h2>
        <div className="h-full flex items-center justify-center text-gray-500">
          No sales data available for the selected time period
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-md" style={{ height: '400px' }}>
      <h2 className="text-lg font-semibold mb-4">Sales Overview - {timeFilter}</h2>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="label"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId="left" 
            orientation="left" 
            stroke="#8884d8"
            tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#82ca9d"
          />
          <Tooltip 
            formatter={(value, name) => {
              if (name === "Revenue") return `₹${value.toLocaleString('en-IN')}`;
              return value;
            }}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="revenue"
            name="Revenue"
            fill="#8884d8"
          />
          <Bar
            yAxisId="right"
            dataKey="orders"
            name="Orders"
            fill="#82ca9d"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
