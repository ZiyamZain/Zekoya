import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get sales report
// @route   GET /api/admin/reports/sales
// @access  Private/Admin
export const getSalesReport = asyncHandler(async (req, res) => {
  try {
    // For Excel exports, the token might be in the query parameters instead of the header
    // This is a workaround for direct file downloads where setting headers is difficult
    if (req.query.format === 'excel' && req.query.token && !req.headers.authorization) {
      req.headers.authorization = `Bearer ${req.query.token}`;
    }
    const { startDate, endDate, format } = req.query;
    
    // Validate date parameters
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required',
      });
    }
    
    // Create date range filter
    const dateFilter = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(`${endDate}T23:59:59.999Z`), // Include the entire end date
      },
    };
    
    // Get orders within date range
    const orders = await Order.find(dateFilter)
      .populate('user', 'name email')
      .populate({
        path: 'orderItems.product',
        select: 'name price category'
      })
      .sort({ createdAt: -1 });
      
    // Log the first order to debug
    if (orders.length > 0) {
      console.log('First order in report:', {
        _id: orders[0]._id,
        orderId: orders[0].orderId,
        totalPrice: orders[0].totalPrice
      });
    }
    
    // Calculate summary statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalDiscount = orders.reduce((sum, order) => sum + (order.couponDiscount || 0), 0);
    
    // Group orders by payment method
    const paymentMethodCounts = {};
    orders.forEach(order => {
      const method = order.paymentMethod;
      paymentMethodCounts[method] = (paymentMethodCounts[method] || 0) + 1;
    });
    
    // Group orders by date
    const dailySales = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!dailySales[date]) {
        dailySales[date] = {
          count: 0,
          revenue: 0,
          discount: 0,
        };
      }
      dailySales[date].count += 1;
      dailySales[date].revenue += order.totalPrice;
      dailySales[date].discount += (order.couponDiscount || 0);
    });

    // Group orders by product category
    const categorySales = {};
    orders.forEach(order => {
      // Skip if orderItems array is not available
      if (!Array.isArray(order.orderItems)) {
        console.log('Order missing orderItems array:', order._id);
        return;
      }
      
      order.orderItems.forEach(item => {
        // Check if product exists and has category
        if (item.product) {
          // Get category - handle both string and object cases
          let category;
          if (typeof item.product.category === 'string') {
            category = item.product.category;
          } else if (item.product.category && item.product.category.toString) {
            category = item.product.category.toString();
          } else {
            // If category is not available, use 'Uncategorized'
            category = 'Uncategorized';
          }
          
          if (!categorySales[category]) {
            categorySales[category] = {
              count: 0,
              revenue: 0,
            };
          }
          categorySales[category].count += item.quantity;
          categorySales[category].revenue += item.price * item.quantity;
        }
      });
    });
    
    // If format is excel, generate and return Excel file
    if (format === 'excel') {
      // Create a new Excel workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Zekoya E-commerce';
      workbook.lastModifiedBy = 'Admin';
      workbook.created = new Date();
      workbook.modified = new Date();
      
      // Add a summary sheet
      const summarySheet = workbook.addWorksheet('Summary');
      
      // Add title with date range
      summarySheet.mergeCells('A1:F1');
      const titleCell = summarySheet.getCell('A1');
      titleCell.value = `Sales Report (${startDate} to ${endDate})`;
      titleCell.font = {
        size: 16,
        bold: true,
        color: { argb: '4F33FF' }
      };
      titleCell.alignment = { horizontal: 'center' };
      
      // Add company info
      summarySheet.mergeCells('A2:F2');
      const companyCell = summarySheet.getCell('A2');
      companyCell.value = 'Zekoya E-commerce Platform';
      companyCell.font = {
        size: 12,
        bold: true
      };
      companyCell.alignment = { horizontal: 'center' };
      
      // Add report generation date
      summarySheet.mergeCells('A3:F3');
      const dateCell = summarySheet.getCell('A3');
      dateCell.value = `Report Generated: ${new Date().toLocaleString()}`;
      dateCell.font = {
        italic: true
      };
      dateCell.alignment = { horizontal: 'center' };
      
      // Add summary section
      summarySheet.addRow([]);
      summarySheet.addRow(['Summary Statistics']);
      summarySheet.getRow(5).font = { bold: true, size: 14 };
      
      summarySheet.addRow(['Total Orders', totalOrders]);
      summarySheet.addRow(['Total Revenue', `₹${totalRevenue.toFixed(2)}`]);
      summarySheet.addRow(['Total Discounts', `₹${totalDiscount.toFixed(2)}`]);
      summarySheet.addRow(['Net Revenue', `₹${(totalRevenue - totalDiscount).toFixed(2)}`]);
      
      // Format the summary section
      for (let i = 6; i <= 9; i++) {
        summarySheet.getRow(i).getCell(1).font = { bold: true };
        if (i >= 7 && i <= 9) {
          summarySheet.getRow(i).getCell(2).numFmt = '₹#,##0.00';
        }
      }
      
      // Add payment method breakdown
      summarySheet.addRow([]);
      summarySheet.addRow(['Payment Method Breakdown']);
      summarySheet.getRow(11).font = { bold: true, size: 14 };
      
      summarySheet.addRow(['Payment Method', 'Count', 'Percentage']);
      summarySheet.getRow(12).font = { bold: true };
      
      let rowIndex = 13;
      Object.entries(paymentMethodCounts).forEach(([method, count]) => {
        const percentage = (count / totalOrders * 100).toFixed(2);
        summarySheet.addRow([method, count, `${percentage}%`]);
        rowIndex++;
      });
      
      // Style the payment method table
      for (let i = 12; i < rowIndex; i++) {
        ['A', 'B', 'C'].forEach(col => {
          summarySheet.getCell(`${col}${i}`).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      }
      
      // Set column widths
      summarySheet.getColumn('A').width = 25;
      summarySheet.getColumn('B').width = 15;
      summarySheet.getColumn('C').width = 15;
      
      // Add daily sales sheet
      const dailySheet = workbook.addWorksheet('Daily Sales');
      
      // Add headers
      dailySheet.addRow(['Date', 'Orders', 'Revenue', 'Discounts', 'Net Revenue']);
      dailySheet.getRow(1).font = { bold: true };
      dailySheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      
      // Add data
      Object.entries(dailySales)
        .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
        .forEach(([date, data]) => {
          dailySheet.addRow([
            date,
            data.count,
            data.revenue,
            data.discount,
            data.revenue - data.discount
          ]);
        });
      
      // Format the daily sales sheet
      dailySheet.getColumn('A').width = 15;
      dailySheet.getColumn('B').width = 10;
      dailySheet.getColumn('C').width = 15;
      dailySheet.getColumn('D').width = 15;
      dailySheet.getColumn('E').width = 15;
      
      // Format currency columns
      for (let i = 2; i <= dailySheet.rowCount; i++) {
        ['C', 'D', 'E'].forEach(col => {
          dailySheet.getCell(`${col}${i}`).numFmt = '₹#,##0.00';
        });
      }
      
      // Add category sales sheet
      const categorySheet = workbook.addWorksheet('Category Sales');
      
      // Add headers
      categorySheet.addRow(['Category', 'Items Sold', 'Revenue', 'Percentage of Total Revenue']);
      categorySheet.getRow(1).font = { bold: true };
      categorySheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      
      // Add data
      Object.entries(categorySales)
        .sort(([, dataA], [, dataB]) => dataB.revenue - dataA.revenue)
        .forEach(([category, data]) => {
          const percentage = (data.revenue / totalRevenue * 100).toFixed(2);
          categorySheet.addRow([
            category,
            data.count,
            data.revenue,
            `${percentage}%`
          ]);
        });
      
      // Format the category sales sheet
      categorySheet.getColumn('A').width = 30;
      categorySheet.getColumn('B').width = 15;
      categorySheet.getColumn('C').width = 15;
      categorySheet.getColumn('D').width = 20;
      
      // Format currency columns
      for (let i = 2; i <= categorySheet.rowCount; i++) {
        categorySheet.getCell(`C${i}`).numFmt = '₹#,##0.00';
      }
      
      // Add detailed orders sheet
      const ordersSheet = workbook.addWorksheet('Order Details');
      
      // Add headers
      ordersSheet.addRow([
        'Order ID',
        'Date',
        'Customer',
        'Email',
        'Items',
        'Payment Method',
        'Status',
        'Coupon',
        'Discount',
        'Total'
      ]);
      ordersSheet.getRow(1).font = { bold: true };
      ordersSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      
      // Add order data
      orders.forEach(order => {
        try {
          // Use orderItems array
          const itemCount = Array.isArray(order.orderItems) 
            ? order.orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0) 
            : 0;
          
          // Get order status - handle different property names
          const status = order.status || order.orderStatus || 'Unknown';
          
          ordersSheet.addRow([
            order.orderId || (order._id ? order._id.toString() : 'Unknown'),
            new Date(order.createdAt).toLocaleDateString(),
            order.user?.name || 'Guest',
            order.user?.email || 'N/A',
            itemCount,
            order.paymentMethod || 'Unknown',
            status,
            order.couponCode || 'None',
            order.couponDiscount || 0,
            order.totalPrice || 0
          ]);
        } catch (err) {
          console.error(`Error adding order to Excel: ${err.message}`, {
            orderId: order.orderId || (order._id ? order._id.toString() : 'Unknown')
          });
          // Add a row with error information
          ordersSheet.addRow([
            order.orderId || (order._id ? order._id.toString() : 'Unknown'),
            'Error processing order data',
            '', '', '', '', '', '', '', ''
          ]);
        }
      });
      
      // Format the orders sheet
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach((col, index) => {
        const widths = [20, 15, 20, 25, 10, 20, 15, 15, 15, 15];
        ordersSheet.getColumn(col).width = widths[index];
      });
      
      // Format currency columns
      for (let i = 2; i <= ordersSheet.rowCount; i++) {
        ['I', 'J'].forEach(col => {
          ordersSheet.getCell(`${col}${i}`).numFmt = '₹#,##0.00';
        });
      }
      
      // Set the response headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Zekoya_Sales_Report_${startDate}_to_${endDate}.xlsx`);
      
      // Write the workbook to the response
      await workbook.xlsx.write(res);
      
      return;
    }
    
    // Prepare JSON response (for non-Excel format)
    const report = {
      summary: {
        totalOrders,
        totalRevenue,
        totalDiscount,
        paymentMethodCounts,
      },
      dailySales: Object.entries(dailySales).map(([date, data]) => ({
        date,
        ...data,
      })),
      categorySales: Object.entries(categorySales).map(([category, data]) => ({
        category,
        ...data,
      })),
      orders,
      dateRange: {
        startDate,
        endDate,
      },
    };
    
    res.status(200).json(report);
  } catch (error) {
    console.error('Error generating sales report:', error);
    
    // Log more detailed error information for debugging
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    
    // Check if headers have already been sent (for Excel export)
    if (res.headersSent) {
      console.error('Headers already sent, cannot send error response');
      return;
    }
    
    // Send detailed error response
    res.status(500).json({
      success: false,
      message: 'Error generating sales report',
      error: error.message,
      details: error.stack ? error.stack.split('\n')[0] : 'No additional details',
    });
  }
});

// @desc    Export sales report as Excel
// @route   POST /api/admin/reports/excel
// @access  Private/Admin
export const exportSalesReportExcel = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    // Validate date parameters
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required',
      });
    }
    
    // Create date range filter
    const dateFilter = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(`${endDate}T23:59:59.999Z`), // Include the entire end date
      },
    };
    
    // Get orders within date range
    const orders = await Order.find(dateFilter)
      .populate('user', 'name email')
      .populate({
        path: 'orderItems.product',
        select: 'name price category'
      })
      .sort({ createdAt: -1 });
      
    // Log the first order to debug
    if (orders.length > 0) {
      console.log('First order in Excel export:', {
        _id: orders[0]._id,
        orderId: orders[0].orderId,
        totalPrice: orders[0].totalPrice
      });
    }
    
    // Calculate summary statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalDiscount = orders.reduce((sum, order) => sum + (order.couponDiscount || 0), 0);
    
    // Group orders by payment method
    const paymentMethodCounts = {};
    orders.forEach(order => {
      const method = order.paymentMethod;
      paymentMethodCounts[method] = (paymentMethodCounts[method] || 0) + 1;
    });
    
    // Group orders by date
    const dailySales = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!dailySales[date]) {
        dailySales[date] = {
          count: 0,
          revenue: 0,
          discount: 0,
        };
      }
      dailySales[date].count += 1;
      dailySales[date].revenue += order.totalPrice;
      dailySales[date].discount += (order.couponDiscount || 0);
    });

    // Group orders by product category
    const categorySales = {};
    orders.forEach(order => {
      // Skip if orderItems array is not available
      if (!Array.isArray(order.orderItems)) {
        console.log('Order missing orderItems array:', order._id);
        return;
      }
      
      order.orderItems.forEach(item => {
        // Check if product exists and has category
        if (item.product) {
          // Get category - handle both string and object cases
          let category;
          if (typeof item.product.category === 'string') {
            category = item.product.category;
          } else if (item.product.category && item.product.category.toString) {
            category = item.product.category.toString();
          } else {
            // If category is not available, use 'Uncategorized'
            category = 'Uncategorized';
          }
          
          if (!categorySales[category]) {
            categorySales[category] = {
              count: 0,
              revenue: 0,
            };
          }
          categorySales[category].count += item.quantity;
          categorySales[category].revenue += item.price * item.quantity;
        }
      });
    });
    
    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Zekoya E-commerce';
    workbook.lastModifiedBy = 'Admin';
    workbook.created = new Date();
    workbook.modified = new Date();
    
    // Add a summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    
    // Add title with date range
    summarySheet.mergeCells('A1:F1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = `Sales Report (${startDate} to ${endDate})`;
    titleCell.font = {
      size: 16,
      bold: true,
      color: { argb: '4F33FF' }
    };
    titleCell.alignment = { horizontal: 'center' };
    
    // Add company info
    summarySheet.mergeCells('A2:F2');
    const companyCell = summarySheet.getCell('A2');
    companyCell.value = 'Zekoya E-commerce Platform';
    companyCell.font = {
      size: 12,
      bold: true
    };
    companyCell.alignment = { horizontal: 'center' };
    
    // Add date generated
    summarySheet.mergeCells('A3:F3');
    const dateCell = summarySheet.getCell('A3');
    dateCell.value = `Generated on: ${new Date().toLocaleString()}`;
    dateCell.font = {
      italic: true
    };
    dateCell.alignment = { horizontal: 'center' };
    
    // Add summary section
    summarySheet.addRow([]);
    summarySheet.addRow(['Summary Statistics']);
    summarySheet.getRow(5).font = { bold: true, size: 14 };
    
    summarySheet.addRow(['Total Orders', totalOrders]);
    summarySheet.addRow(['Total Revenue', `₹${totalRevenue.toFixed(2)}`]);
    summarySheet.addRow(['Total Discount', `₹${totalDiscount.toFixed(2)}`]);
    
    // Add payment method breakdown
    summarySheet.addRow([]);
    summarySheet.addRow(['Payment Method Breakdown']);
    summarySheet.getRow(9).font = { bold: true, size: 14 };
    
    // Add payment method header
    summarySheet.addRow(['Payment Method', 'Count', 'Percentage']);
    summarySheet.getRow(10).font = { bold: true };
    summarySheet.getRow(10).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Add payment method data
    let rowIndex = 11;
    Object.entries(paymentMethodCounts).forEach(([method, count]) => {
      const percentage = (count / totalOrders * 100).toFixed(2);
      summarySheet.addRow([method, count, `${percentage}%`]);
      rowIndex++;
    });
    
    // Style the payment method table
    for (let i = 10; i < rowIndex; i++) {
      ['A', 'B', 'C'].forEach(col => {
        summarySheet.getCell(`${col}${i}`).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }
    
    // Add daily sales sheet
    const dailySheet = workbook.addWorksheet('Daily Sales');
    
    // Add headers
    dailySheet.addRow(['Date', 'Orders', 'Revenue', 'Discount', 'Net Revenue']);
    dailySheet.getRow(1).font = { bold: true };
    dailySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Add daily sales data
    Object.entries(dailySales)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .forEach(([date, data]) => {
        dailySheet.addRow([
          date,
          data.count,
          data.revenue,
          data.discount,
          data.revenue - data.discount
        ]);
      });
    
    // Format the daily sales sheet
    dailySheet.getColumn('A').width = 15;
    dailySheet.getColumn('B').width = 10;
    dailySheet.getColumn('C').width = 15;
    dailySheet.getColumn('D').width = 15;
    dailySheet.getColumn('E').width = 15;
    
    // Format currency columns
    for (let i = 2; i <= dailySheet.rowCount; i++) {
      ['C', 'D', 'E'].forEach(col => {
        dailySheet.getCell(`${col}${i}`).numFmt = '₹#,##0.00';
      });
    }
    
    // Add category sales sheet
    const categorySheet = workbook.addWorksheet('Category Sales');
    
    // Add headers
    categorySheet.addRow(['Category', 'Items Sold', 'Revenue']);
    categorySheet.getRow(1).font = { bold: true };
    categorySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Add category sales data
    Object.entries(categorySales)
      .sort(([, dataA], [, dataB]) => dataB.revenue - dataA.revenue)
      .forEach(([category, data]) => {
        categorySheet.addRow([category, data.count, data.revenue]);
      });
    
    // Format the category sheet
    categorySheet.getColumn('A').width = 30;
    categorySheet.getColumn('B').width = 15;
    categorySheet.getColumn('C').width = 15;
    
    // Format currency columns
    for (let i = 2; i <= categorySheet.rowCount; i++) {
      categorySheet.getCell(`C${i}`).numFmt = '₹#,##0.00';
    }
    
    // Add detailed orders sheet
    const ordersSheet = workbook.addWorksheet('Order Details');
    
    // Add headers
    ordersSheet.addRow([
      'Order ID',
      'Date',
      'Customer',
      'Email',
      'Items',
      'Payment Method',
      'Status',
      'Coupon',
      'Discount',
      'Total'
    ]);
    
    // Style the header row
    ordersSheet.getRow(1).font = { bold: true };
    ordersSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Add order data
    orders.forEach(order => {
      try {
        // Use orderItems array
        const itemCount = Array.isArray(order.orderItems) 
          ? order.orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0) 
          : 0;
        
        // Get order status - handle different property names
        const status = order.status || order.orderStatus || 'Unknown';
        
        ordersSheet.addRow([
          order.orderId || (order._id ? order._id.toString() : 'Unknown'),
          new Date(order.createdAt).toLocaleDateString(),
          order.user?.name || 'Guest',
          order.user?.email || 'N/A',
          itemCount,
          order.paymentMethod || 'Unknown',
          status,
          order.couponCode || 'None',
          order.couponDiscount || 0,
          order.totalPrice || 0
        ]);
      } catch (err) {
        console.error(`Error adding order to Excel: ${err.message}`, {
          orderId: order.orderId || (order._id ? order._id.toString() : 'Unknown')
        });
        // Add a row with error information
        ordersSheet.addRow([
          order.orderId || (order._id ? order._id.toString() : 'Unknown'),
          'Error processing order data',
          '', '', '', '', '', '', '', ''
        ]);
      }
    });
    
    // Format the orders sheet
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach((col, index) => {
      const widths = [20, 15, 20, 25, 10, 20, 15, 15, 15, 15];
      ordersSheet.getColumn(col).width = widths[index];
    });
    
    // Format currency columns
    for (let i = 2; i <= ordersSheet.rowCount; i++) {
      ['I', 'J'].forEach(col => {
        ordersSheet.getCell(`${col}${i}`).numFmt = '₹#,##0.00';
      });
    }
    
    // Set the response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Zekoya_Sales_Report_${startDate}_to_${endDate}.xlsx`);
    
    // Write the workbook to the response
    await workbook.xlsx.write(res);
    
  } catch (error) {
    console.error('Error generating Excel sales report:', error);
    
    // Log more detailed error information for debugging
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    
    // Check if headers have already been sent
    if (res.headersSent) {
      console.error('Headers already sent, cannot send error response');
      return;
    }
    
    // Send detailed error response
    res.status(500).json({
      success: false,
      message: 'Error generating Excel sales report',
      error: error.message,
      details: error.stack ? error.stack.split('\n')[0] : 'No additional details',
    });
  }
});

// @desc    Download Excel report
// @route   GET /api/admin/reports/download-excel
// @access  Private/Admin
export const downloadExcelReport = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate date parameters
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required',
      });
    }
    
    // Create date range filter
    const dateFilter = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(`${endDate}T23:59:59.999Z`), // Include the entire end date
      },
    };
    
    // Get orders within date range
    const orders = await Order.find(dateFilter)
      .populate('user', 'name email')
      .populate({
        path: 'orderItems.product',
        select: 'name price category'
      })
      .sort({ createdAt: -1 });
    
    // Calculate summary statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalDiscount = orders.reduce((sum, order) => sum + (order.couponDiscount || 0), 0);
    
    // Group orders by payment method
    const paymentMethodCounts = {};
    orders.forEach(order => {
      const method = order.paymentMethod;
      paymentMethodCounts[method] = (paymentMethodCounts[method] || 0) + 1;
    });
    
    // Group orders by date
    const dailySales = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!dailySales[date]) {
        dailySales[date] = {
          count: 0,
          revenue: 0,
          discount: 0,
        };
      }
      dailySales[date].count += 1;
      dailySales[date].revenue += order.totalPrice;
      dailySales[date].discount += (order.couponDiscount || 0);
    });

    // Group orders by product category
    const categorySales = {};
    orders.forEach(order => {
      // Skip if orderItems array is not available
      if (!Array.isArray(order.orderItems)) {
        console.log('Order missing orderItems array:', order._id);
        return;
      }
      
      order.orderItems.forEach(item => {
        // Check if product exists and has category
        if (item.product) {
          // Get category - handle both string and object cases
          let category;
          if (typeof item.product.category === 'string') {
            category = item.product.category;
          } else if (item.product.category && item.product.category.toString) {
            category = item.product.category.toString();
          } else {
            // If category is not available, use 'Uncategorized'
            category = 'Uncategorized';
          }
          
          if (!categorySales[category]) {
            categorySales[category] = {
              count: 0,
              revenue: 0,
            };
          }
          categorySales[category].count += item.quantity;
          categorySales[category].revenue += item.price * item.quantity;
        }
      });
    });
    
    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Zekoya E-commerce';
    workbook.lastModifiedBy = 'Admin';
    workbook.created = new Date();
    workbook.modified = new Date();
    
    // Add a summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    
    // Add title with date range
    summarySheet.mergeCells('A1:F1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = `Sales Report (${startDate} to ${endDate})`;
    titleCell.font = {
      size: 16,
      bold: true,
      color: { argb: '4F33FF' }
    };
    titleCell.alignment = { horizontal: 'center' };
    
    // Add company info
    summarySheet.mergeCells('A2:F2');
    const companyCell = summarySheet.getCell('A2');
    companyCell.value = 'Zekoya E-commerce Platform';
    companyCell.font = {
      size: 12,
      bold: true
    };
    companyCell.alignment = { horizontal: 'center' };
    
    // Add date generated
    summarySheet.mergeCells('A3:F3');
    const dateCell = summarySheet.getCell('A3');
    dateCell.value = `Generated on: ${new Date().toLocaleString()}`;
    dateCell.font = {
      italic: true
    };
    dateCell.alignment = { horizontal: 'center' };
    
    // Add summary section
    summarySheet.addRow([]);
    summarySheet.addRow(['Summary Statistics']);
    summarySheet.getRow(5).font = { bold: true, size: 14 };
    
    summarySheet.addRow(['Total Orders', totalOrders]);
    summarySheet.addRow(['Total Revenue', `₹${totalRevenue.toFixed(2)}`]);
    summarySheet.addRow(['Total Discount', `₹${totalDiscount.toFixed(2)}`]);
    
    // Add payment method breakdown
    summarySheet.addRow([]);
    summarySheet.addRow(['Payment Method Breakdown']);
    summarySheet.getRow(9).font = { bold: true, size: 14 };
    
    // Add payment method header
    summarySheet.addRow(['Payment Method', 'Count', 'Percentage']);
    summarySheet.getRow(10).font = { bold: true };
    summarySheet.getRow(10).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Add payment method data
    let rowIndex = 11;
    Object.entries(paymentMethodCounts).forEach(([method, count]) => {
      const percentage = (count / totalOrders * 100).toFixed(2);
      summarySheet.addRow([method, count, `${percentage}%`]);
      rowIndex++;
    });
    
    // Style the payment method table
    for (let i = 10; i < rowIndex; i++) {
      ['A', 'B', 'C'].forEach(col => {
        summarySheet.getCell(`${col}${i}`).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }
    
    // Add daily sales sheet
    const dailySheet = workbook.addWorksheet('Daily Sales');
    
    // Add headers
    dailySheet.addRow(['Date', 'Orders', 'Revenue', 'Discount', 'Net Revenue']);
    dailySheet.getRow(1).font = { bold: true };
    dailySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Add daily sales data
    Object.entries(dailySales)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .forEach(([date, data]) => {
        dailySheet.addRow([
          date,
          data.count,
          data.revenue,
          data.discount,
          data.revenue - data.discount
        ]);
      });
    
    // Format the daily sales sheet
    dailySheet.getColumn('A').width = 15;
    dailySheet.getColumn('B').width = 10;
    dailySheet.getColumn('C').width = 15;
    dailySheet.getColumn('D').width = 15;
    dailySheet.getColumn('E').width = 15;
    
    // Format currency columns
    for (let i = 2; i <= dailySheet.rowCount; i++) {
      ['C', 'D', 'E'].forEach(col => {
        dailySheet.getCell(`${col}${i}`).numFmt = '₹#,##0.00';
      });
    }
    
    // Add category sales sheet
    const categorySheet = workbook.addWorksheet('Category Sales');
    
    // Add headers
    categorySheet.addRow(['Category', 'Items Sold', 'Revenue']);
    categorySheet.getRow(1).font = { bold: true };
    categorySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Add category sales data
    Object.entries(categorySales)
      .sort(([, dataA], [, dataB]) => dataB.revenue - dataA.revenue)
      .forEach(([category, data]) => {
        categorySheet.addRow([category, data.count, data.revenue]);
      });
    
    // Format the category sheet
    categorySheet.getColumn('A').width = 30;
    categorySheet.getColumn('B').width = 15;
    categorySheet.getColumn('C').width = 15;
    
    // Format currency columns
    for (let i = 2; i <= categorySheet.rowCount; i++) {
      categorySheet.getCell(`C${i}`).numFmt = '₹#,##0.00';
    }
    
    // Add detailed orders sheet
    const ordersSheet = workbook.addWorksheet('Order Details');
    
    // Add headers
    ordersSheet.addRow([
      'Order ID',
      'Date',
      'Customer',
      'Email',
      'Items',
      'Payment Method',
      'Status',
      'Coupon',
      'Discount',
      'Total'
    ]);
    
    // Style the header row
    ordersSheet.getRow(1).font = { bold: true };
    ordersSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Add order data
    orders.forEach(order => {
      try {
        // Use orderItems array
        const itemCount = Array.isArray(order.orderItems) 
          ? order.orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0) 
          : 0;
        
        // Get order status - handle different property names
        const status = order.status || order.orderStatus || 'Unknown';
        
        ordersSheet.addRow([
          order.orderId || (order._id ? order._id.toString() : 'Unknown'),
          new Date(order.createdAt).toLocaleDateString(),
          order.user?.name || 'Guest',
          order.user?.email || 'N/A',
          itemCount,
          order.paymentMethod || 'Unknown',
          status,
          order.couponCode || 'None',
          order.couponDiscount || 0,
          order.totalPrice || 0
        ]);
      } catch (err) {
        console.error(`Error adding order to Excel: ${err.message}`, {
          orderId: order.orderId || (order._id ? order._id.toString() : 'Unknown')
        });
        // Add a row with error information
        ordersSheet.addRow([
          order.orderId || (order._id ? order._id.toString() : 'Unknown'),
          'Error processing order data',
          '', '', '', '', '', '', '', ''
        ]);
      }
    });
    
    // Format the orders sheet
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach((col, index) => {
      const widths = [20, 15, 20, 25, 10, 20, 15, 15, 15, 15];
      ordersSheet.getColumn(col).width = widths[index];
    });
    
    // Format currency columns
    for (let i = 2; i <= ordersSheet.rowCount; i++) {
      ['I', 'J'].forEach(col => {
        ordersSheet.getCell(`${col}${i}`).numFmt = '₹#,##0.00';
      });
    }
    
    // Set the response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Zekoya_Sales_Report_${startDate}_to_${endDate}.xlsx`);
    
    // Write the workbook to the response
    await workbook.xlsx.write(res);
    
  } catch (error) {
    console.error('Error generating Excel sales report:', error);
    
    // Log more detailed error information for debugging
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    
    // Check if headers have already been sent
    if (res.headersSent) {
      console.error('Headers already sent, cannot send error response');
      return;
    }
    
    // Send detailed error response
    res.status(500).json({
      success: false,
      message: 'Error generating Excel sales report',
      error: error.message,
      details: error.stack ? error.stack.split('\n')[0] : 'No additional details',
    });
  }
});

// @desc    Get dashboard statistics
// @route   GET /api/admin/reports/dashboard
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // Get current date
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));
    
    // Get start of current week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Get start of current month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Get today's orders
    const todayOrders = await Order.find({
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    });
    
    // Get this week's orders
    const weekOrders = await Order.find({
      createdAt: { $gte: startOfWeek, $lte: endOfToday },
    });
    
    // Get this month's orders
    const monthOrders = await Order.find({
      createdAt: { $gte: startOfMonth, $lte: endOfToday },
    });
    
    // Get pending orders count
    const pendingOrders = await Order.countDocuments({
      status: 'pending'
    });
    
    // Get total user count
    const User = await import('../models/userModel.js').then(module => module.default);
    const userCount = await User.countDocuments({ isBlocked: false });
    
    // Calculate statistics
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const weekRevenue = weekOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const monthRevenue = monthOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    
    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      // No need to use select() to ensure we get all fields including orderId
      .sort({ createdAt: -1 })
      .limit(5);
      
    // Log the first recent order to debug
    if (recentOrders.length > 0) {
      console.log('First recent order:', {
        _id: recentOrders[0]._id,
        orderId: recentOrders[0].orderId,
        totalPrice: recentOrders[0].totalPrice
      });
    }
    
    // Prepare response
    const stats = {
      today: {
        orders: todayOrders.length,
        revenue: todayRevenue,
      },
      week: {
        orders: weekOrders.length,
        revenue: weekRevenue,
      },
      month: {
        orders: monthOrders.length,
        revenue: monthRevenue,
      },
      pendingOrders,
      userCount,
      recentOrders,
    };
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error generating dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating dashboard statistics',
      error: error.message,
    });
  }
});
