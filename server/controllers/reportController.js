import asyncHandler from 'express-async-handler';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

import {
  startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  startOfYear, endOfYear,
  format as formatDate,
  subDays,

} from 'date-fns';
import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';

import Order from '../models/orderModel.js';

export const getSalesReport = asyncHandler(async (req, res) => {
  try {
    const {
      startDate, endDate, period, format, page,
    } = req.query;

    // Validate required parameters
    if ((!startDate || !endDate) && !period) {
      return res.status(400).json({
        success: false,
        message: 'Either date range or period filter is required',
      });
    }

    // Determine date range based on period or custom dates
    let dateFilter = {};
    const now = new Date();

    if (period) {
      switch (period) {
        case 'daily':
          dateFilter = {
            createdAt: {
              $gte: startOfDay(now),
              $lte: endOfDay(now),
            },
          };
          break;
        case 'weekly':
          dateFilter = {
            createdAt: {
              $gte: startOfWeek(now, { weekStartsOn: 1 }),
              $lte: endOfWeek(now, { weekStartsOn: 1 }),
            },
          };
          break;
        case 'monthly':
          dateFilter = {
            createdAt: {
              $gte: startOfMonth(now),
              $lte: endOfMonth(now),
            },
          };
          break;
        case 'yearly':
          dateFilter = {
            createdAt: {
              $gte: startOfYear(now),
              $lte: endOfYear(now),
            },
          };
          break;
        case 'last7days':
          dateFilter = {
            createdAt: {
              $gte: subDays(now, 7),
              $lte: now,
            },
          };
          break;
        case 'last30days':
          dateFilter = {
            createdAt: {
              $gte: subDays(now, 30),
              $lte: now,
            },
          };
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid period specified',
          });
      }
    } else {
      // Custom date range
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(`${endDate}T23:59:59.999Z`),
        },
      };
    }

    // Calculate pagination parameters
    const pageValue = parseInt(page, 10) || 1;
    const limit = 7; // Fixed at 7 orders per page
    const skip = (pageValue - 1) * limit;

    // Get total count of orders for pagination
    const totalOrders = await Order.countDocuments(dateFilter);
    const totalPages = Math.ceil(totalOrders / limit);

    // Aggregate overall summary statistics for the entire period
    const summaryPipeline = [
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalItemsAgg: { $sum: { $sum: '$orderItems.quantity' } },
          subtotalAmountAgg: { $sum: { $ifNull: ['$itemsPrice', 0] } },
          totalTaxAgg: { $sum: { $ifNull: ['$taxPrice', 0] } },
          totalShippingAgg: { $sum: { $ifNull: ['$shippingPrice', 0] } },
          totalCouponDiscountAgg: { $sum: { $ifNull: ['$couponDiscount', 0] } },
          // Assuming order.discountPrice is product/category offer discount, separate from coupon.
          totalProductOfferDiscountAgg: {
            $sum: { $ifNull: ['$discountPrice', 0] },
          },
          totalRevenueAgg: { $sum: { $ifNull: ['$totalPrice', 0] } },
        },
      },
    ];
    const summaryResultsArray = await Order.aggregate(summaryPipeline);
    const periodSummary = summaryResultsArray.length > 0
      ? summaryResultsArray[0]
      : {
        totalItemsAgg: 0,
        subtotalAmountAgg: 0,
        totalTaxAgg: 0,
        totalShippingAgg: 0,
        totalCouponDiscountAgg: 0,
        totalProductOfferDiscountAgg: 0,
        totalRevenueAgg: 0,
      };

    // Aggregate payment method statistics for the entire period
    const paymentMethodStatsAgg = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalPrice' },
        },
      },
    ]);
    const paymentMethodCounts = {};
    const paymentMethodAmounts = {};
    paymentMethodStatsAgg.forEach((stat) => {
      if (stat._id) {
        // Ensure _id is not null/undefined
        paymentMethodCounts[stat._id] = stat.count;
        paymentMethodAmounts[stat._id] = stat.totalAmount;
      }
    });

    const newPaymentMethodsArray = Object.keys(paymentMethodCounts).map(
      (method) => ({
        method,
        count: paymentMethodCounts[method],
        amount: paymentMethodAmounts[method] || 0,
        percentage:
          totalOrders > 0
            ? ((paymentMethodCounts[method] / totalOrders) * 100).toFixed(2)
            : '0.00',
      }),
    );

    // Get orders within date range with detailed population (for the table)
    const orders = await Order.find(dateFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'user',
        select: 'name email',
      })
      .populate({
        path: 'orderItems.product',
        select: 'name price category brand image countInStock',
        populate: {
          path: 'category',
          select: 'name',
        },
      })
      .lean();

    // Analyze daily sales
    const dailySales = {};

    orders.forEach((order) => {
      const date = formatDate(new Date(order.createdAt), 'yyyy-MM-dd');

      if (!dailySales[date]) {
        dailySales[date] = {
          count: 0,
          items: 0,
          revenue: 0,
          discount: 0,
          couponDiscount: 0,
          productDiscount: 0,
          tax: 0,
          shipping: 0,
        };
      }

      dailySales[date].count += 1;
      dailySales[date].items += order.orderItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      dailySales[date].revenue += order.totalPrice;
      dailySales[date].discount += order.discountPrice || 0;
      dailySales[date].couponDiscount += order.couponDiscount || 0;
      dailySales[date].productDiscount
        += (order.discountPrice || 0) - (order.couponDiscount || 0);
      dailySales[date].tax += order.taxPrice || 0;
      dailySales[date].shipping += order.shippingPrice || 0;
    });

    // Convert to array and sort by date
    const dailySalesArray = Object.entries(dailySales)
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Group orders by product category
    const categorySales = {};
    const brandSales = {};
    const productSales = {};

    orders.forEach((order) => {
      if (!Array.isArray(order.orderItems)) {
        return;
      }

      order.orderItems.forEach((item) => {
        if (item.product) {
          // Process category sales
          let category;
          if (typeof item.product.category === 'string') {
            category = item.product.category;
          } else if (item.product.category && item.product.category.toString) {
            category = item.product.category.toString();
          } else {
            category = 'Uncategorized';
          }

          if (!categorySales[category]) {
            categorySales[category] = {
              count: 0,
              revenue: 0,
              items: 0,
            };
          }
          categorySales[category].count += 1;
          categorySales[category].items += item.quantity;
          categorySales[category].revenue += item.price * item.quantity;

          // Process brand sales
          let brand;
          if (typeof item.product.brand === 'string') {
            brand = item.product.brand;
          } else if (item.product.brand && item.product.brand.toString) {
            brand = item.product.brand.toString();
          } else {
            brand = 'Unbranded';
          }

          if (!brandSales[brand]) {
            brandSales[brand] = {
              count: 0,
              revenue: 0,
              items: 0,
            };
          }
          brandSales[brand].count += 1;
          brandSales[brand].items += item.quantity;
          brandSales[brand].revenue += item.price * item.quantity;

          // Process product sales
          const productId = item.product._id.toString();
          if (!productSales[productId]) {
            productSales[productId] = {
              name: item.product.name,
              count: 0,
              revenue: 0,
              items: 0,
            };
          }
          productSales[productId].count += 1;
          productSales[productId].items += item.quantity;
          productSales[productId].revenue += item.price * item.quantity;
        }
      });
    });

    // Convert objects to arrays for the response
    const categorySalesArray = Object.entries(categorySales)
      .map(([category, data]) => ({
        category,
        ...data,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const brandSalesArray = Object.entries(brandSales)
      .map(([brand, data]) => ({
        brand,
        ...data,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const productSalesArray = Object.entries(productSales)
      .map(([id, data]) => ({
        id,
        ...data,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Process orders for response
    const processedOrders = orders.map((order) => ({
      _id: order._id,
      orderId: order.orderId || `${order._id.toString().substring(0, 8)}...`,
      user: order.user ? {
        _id: order.user._id,
        name: order.user.name,
        email: order.user.email,
      } : { name: 'Guest', email: 'N/A' },
      createdAt: order.createdAt,
      paymentMethod: order.paymentMethod || 'N/A',
      paymentStatus: order.paymentStatus || 'pending',
      orderStatus: order.orderStatus || 'pending',
      isPaid: order.isPaid || false,
      paidAt: order.paidAt,
      isDelivered: order.isDelivered || false,
      deliveredAt: order.deliveredAt,
      itemsPrice: order.itemsPrice || 0,
      taxPrice: order.taxPrice || 0,
      shippingPrice: order.shippingPrice || 0,
      discountPrice: order.discountPrice || 0,
      couponDiscount: order.couponDiscount || 0,
      totalPrice: order.totalPrice || 0,
      itemCount: (order.orderItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0),
    }));

    // Prepare response data
    const responseData = {
      summary: {
        totalOrders,
        totalItems: periodSummary.totalItemsAgg || 0,
        subtotalAmount: periodSummary.subtotalAmountAgg || 0,
        totalTax: periodSummary.totalTaxAgg || 0,
        totalShipping: periodSummary.totalShippingAgg || 0,
        totalCouponDiscount: periodSummary.totalCouponDiscountAgg || 0,
        totalProductDiscount: periodSummary.totalProductOfferDiscountAgg || 0,
        totalDiscount: (periodSummary.totalProductOfferDiscountAgg || 0)
          + (periodSummary.totalCouponDiscountAgg || 0),
        totalRevenue: periodSummary.totalRevenueAgg || 0,
        averageOrderValue: totalOrders > 0 ? (periodSummary.totalRevenueAgg / totalOrders) : 0,
        paymentMethods: newPaymentMethodsArray,
      },
      dailySales: dailySalesArray,
      categorySales: categorySalesArray,
      brandSales: brandSalesArray,
      productSales: productSalesArray,
      orders: processedOrders,
      pagination: {
        total: totalOrders,
        pages: totalPages,
        totalPages, // Add totalPages to match frontend expectation
        page: pageValue,
        hasNextPage: pageValue < totalPages,
        hasPreviousPage: pageValue > 1,
      },
    };

    if (format === 'excel') {
      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sales Report');

      // Add headers with styling
      const headerRow = worksheet.addRow([
        'Order ID', 'Date', 'Customer', 'Items', 'Amount', 'Discount', 'Total', 'Status', 'Payment Method',
      ]);

      // Style header row
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2c3e50' },
      };
      headerRow.eachCell((cell) => {
        // eslint-disable-next-line no-param-reassign
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        // eslint-disable-next-line no-param-reassign
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // Add summary section
      worksheet.addRow([]);
      const summaryHeaderRow = worksheet.addRow(['Summary']);
      summaryHeaderRow.font = { bold: true, size: 14 };

      worksheet.addRow(['Total Orders', responseData.summary.totalOrders]);
      worksheet.addRow(['Total Revenue', `₹${responseData.summary.totalRevenue.toFixed(2)}`]);
      worksheet.addRow(['Total Discount', `₹${responseData.summary.totalDiscount.toFixed(2)}`]);
      worksheet.addRow(['Average Order Value', `₹${responseData.summary.averageOrderValue.toFixed(2)}`]);

      worksheet.addRow([]);
      worksheet.addRow(['Orders']);
      worksheet.addRow([]);

      // Add data rows
      responseData.orders.forEach((order) => {
        const row = worksheet.addRow([
          order.orderId || order._id,
          formatDate(new Date(order.createdAt), 'yyyy-MM-dd'),
          order.user?.name || 'Guest',
          order.itemCount,
          order.itemsPrice || 0,
          (order.discountPrice || 0) + (order.couponDiscount || 0),
          order.totalPrice || 0,
          order.orderStatus || 'N/A',
          order.paymentMethod || 'N/A',
        ]);

        // Format numbers with 2 decimal places
        row.getCell(5).numFmt = '0.00';
        row.getCell(6).numFmt = '0.00';
        row.getCell(7).numFmt = '0.00';
      });

      // Auto-fit columns
      worksheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 0;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        // eslint-disable-next-line no-param-reassign
        column.width = Math.min(maxLength + 2, 30);
      });

      // Set response headers for Excel download
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=sales-report-${Date.now()}.xlsx`,
      );

      try {
        // Write the workbook to the response

        const buffer = await workbook.xlsx.writeBuffer();

        return res.send(buffer);
      } catch (error) {
        console.error('Error generating Excel:', error);
        return res.status(500).json({
          success: false,
          message: 'Error generating Excel report',
        });
      }
    } else if (format === 'pdf') {
      try {
        // Create a new PDF document with better margins
        const doc = new PDFDocument({
          margin: 40,
          size: 'A4',
          layout: 'landscape', // Consider landscape if there are many columns
        });

        // Set response headers for PDF download
        const filename = `sales-report_${req.query.startDate || req.query.period || 'all'}_to_${req.query.endDate || 'all'}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${filename}"`,
        );
        doc.pipe(res);

        // --- Report Header ---
        doc
          .fontSize(18)
          .font('Helvetica-Bold')
          .text('Sales Report', { align: 'center' });
        doc.moveDown();
        const reportDateRange = period
          ? `Period: ${period}`
          : `From: ${formatDate(
            new Date(dateFilter.createdAt.$gte),
            'yyyy-MM-dd',
          )} To: ${formatDate(
            new Date(dateFilter.createdAt.$lte),
            'yyyy-MM-dd',
          )}`;
        doc.fontSize(10).font('Helvetica').text(reportDateRange, { align: 'center' });
        doc.moveDown(2);


        // --- Summary Section (Using periodSummary) ---
        doc.fontSize(12).font('Helvetica-Bold').text('Report Summary:', { underline: true });
        doc.moveDown(0.5);
        
        let currentY = doc.y; // Y position for current row
        const summaryLabelX = doc.x; // Starts at left margin
        const summaryValueX = summaryLabelX + 200; // X position for the start of value text
        const summaryValueWidth = 100; // Width for the value text block, allows for right alignment
        const summaryLineHeight = doc.currentLineHeight() + 3;

        const printSummaryRow = (label, value) => {
          doc.font('Helvetica-Bold').fontSize(9).text(label, summaryLabelX, currentY);
          doc.font('Helvetica').fontSize(9).text(value, summaryValueX, currentY, {
            width: summaryValueWidth,
            align: 'right'
          });
          currentY += summaryLineHeight;
        };

        printSummaryRow('Total Orders:', totalOrders.toString());
        printSummaryRow('Total Items Sold:', periodSummary.totalItemsAgg.toFixed(0));
        printSummaryRow('Subtotal (Items Price):', `₹${periodSummary.subtotalAmountAgg.toFixed(2)}`);
        printSummaryRow('Total Product/Offer Discounts:', `₹${periodSummary.totalProductOfferDiscountAgg.toFixed(2)}`);
        printSummaryRow('Total Coupon Discounts:', `₹${periodSummary.totalCouponDiscountAgg.toFixed(2)}`);
        // Tax is removed as per request
        // printSummaryRow('Total Tax:', `₹${periodSummary.totalTaxAgg.toFixed(2)}`); 
        printSummaryRow('Total Shipping:', `₹${periodSummary.totalShippingAgg.toFixed(2)}`);
        printSummaryRow('Total Revenue:', `₹${periodSummary.totalRevenueAgg.toFixed(2)}`);
        
        doc.y = currentY; // Update doc.y to position after last summary item
        doc.moveDown(2);


        // --- Table Headers ---
        const tableTop = doc.y; // Y position for the table headers
        const headers = [
          'Order ID', // Left
          'Date',     // Left
          'Customer', // Left
          'Items Price',// Right
          'Offer Disc.',// Right
          'Coupon',     // Center
          'Coupon Disc.',// Right
          // Tax column removed
          'Shipping',   // Right
          'Total',      // Right
          'Status',     // Center
        ];
        // Adjusted column widths for 10 columns to fit A4 landscape (~761 points available)
        const columnWidths = [75, 60, 110, 75, 70, 70, 75, 65, 80, 50]; // Sum: 730
        let currentX = doc.page.margins.left; // Explicitly start at left page margin

        doc.font('Helvetica-Bold').fontSize(8);
        headers.forEach((header, i) => {
          let align = 'left';
          if (['Items Price', 'Offer Disc.', 'Coupon Disc.', 'Shipping', 'Total'].includes(header)) {
            align = 'right';
          } else if (['Coupon', 'Status'].includes(header)) {
            align = 'center';
          }
          // Use currentX directly as the starting X for the cell, and full columnWidths[i]
          doc.text(header, currentX, tableTop, {
            width: columnWidths[i],
            align: align,
          });
          currentX += columnWidths[i];
        });
        doc.moveDown(0.5); // Space after headers
        const headerBottomY = doc.y;
        doc
          .moveTo(doc.x, headerBottomY)
          .lineTo(doc.x + columnWidths.reduce((a, b) => a + b, 0) - doc.page.margins.left , headerBottomY) // Adjust line width
          .stroke();
        doc.moveDown();


        // --- Table Rows ---
        currentY = doc.y;
        doc.font('Helvetica').fontSize(7); // Smaller font for table data

        const ordersToProcess = format === 'pdf' ? await Order.find(dateFilter) // Fetch all for PDF
          .sort({ createdAt: -1 })
          .populate('user', 'name email')
          .lean() : processedOrders;


        // Chunk orders for pagination within PDF (if needed, but for now, let's try to fit all)
        // For simplicity, this example will try to render all orders.
        // Proper pagination within PDF would require more complex logic for page breaks.

        ordersToProcess.forEach((order) => {
          // Check if new page is needed
          if (currentY + 30 > doc.page.height - doc.page.margins.bottom) { // 30 is an estimated row height
            doc.addPage({ layout: 'landscape', margin: 40 });
            currentY = doc.page.margins.top;
            // Redraw headers on new page
            let tempX = doc.page.margins.left;
            doc.font('Helvetica-Bold').fontSize(8);
            headers.forEach((header, i) => {
              let align = 'left';
              if (['Items Price', 'Offer Disc.', 'Coupon Disc.', 'Shipping', 'Total'].includes(header)) {
                align = 'right';
              } else if (['Coupon', 'Status'].includes(header)) {
                align = 'center';
              }
              // Use tempX directly as the starting X for the cell, and full columnWidths[i]
              doc.text(header, tempX, currentY, {
                width: columnWidths[i],
                align: align,
              });
              tempX += columnWidths[i];
            });
            doc.moveDown(0.5);
            const newHeaderBottomY = doc.y;
             doc
              .moveTo(doc.page.margins.left, newHeaderBottomY)
              .lineTo(doc.page.margins.left + columnWidths.reduce((a, b) => a + b, 0), newHeaderBottomY)
              .stroke();
            doc.moveDown();
            currentY = doc.y;
            doc.font('Helvetica').fontSize(7);
          }

          let cellX = doc.page.margins.left;
          const rowData = [
            order.orderId || order._id.toString().substring(0, 8),
            formatDate(new Date(order.createdAt), 'dd-MM-yy'),
            order.user ? order.user.name : 'N/A',
            `₹${(order.itemsPrice || 0).toFixed(2)}`,
            `₹${(order.discountPrice || 0).toFixed(2)}`, // Product/Category Offer Discount
            order.couponCode || '-',
            `₹${(order.couponDiscount || 0).toFixed(2)}`,
            // taxPrice removed
            `₹${(order.shippingPrice || 0).toFixed(2)}`,
            `₹${((order.itemsPrice || 0) - (order.discountPrice || 0) - (order.couponDiscount || 0) + (order.shippingPrice || 0) + (order.taxPrice || 0)).toFixed(2)}`,
            order.orderStatus || 'N/A',
          ];

          rowData.forEach((cell, i) => {
            let align = 'left';
            // Determine alignment based on header (matches header logic)
            const headerText = headers[i];
             if (['Items Price', 'Offer Disc.', 'Coupon Disc.', 'Shipping', 'Total'].includes(headerText)) {
              align = 'right';
            } else if (['Coupon', 'Status'].includes(headerText)) {
              align = 'center';
            }
            // Use cellX directly as the starting X for the cell, and full columnWidths[i]
            doc.text(cell.toString(), cellX, currentY, {
              width: columnWidths[i],
              align: align, 
            });
            cellX += columnWidths[i];
          });
          currentY = doc.y + 5; // Move Y for next row, add some padding
          
          // Draw horizontal line after each row
          doc.moveTo(doc.page.margins.left, currentY + 2)
             .lineTo(doc.page.width - doc.page.margins.right, currentY + 2)
             .strokeColor('#CCCCCC') // Light gray color for row lines
             .stroke();
          doc.strokeColor('black'); // Reset stroke color
          currentY += 5; // Move to next line for data
        });

        // --- Footer with Page Numbers ---
        const range = doc.bufferedPageRange();
        for (
          let i = range.start;
          i < range.start + range.count;
          i += 1
        ) {
          doc.switchToPage(i);
          doc
            .fontSize(8)
            .font('Helvetica')
            .text(
              `Page ${i + 1} of ${range.count}`,
              doc.page.margins.left,
              doc.page.height - doc.page.margins.bottom + 10,
              { align: 'center' },
            );
        }

        doc.end();
      } catch (error) {
        console.error('Error generating PDF:', error);
        return res.status(500).json({
          success: false,
          message: 'Error generating PDF report',
        });
      }
    } else {
      // Return JSON response
      return res.status(200).json({
        success: true,
        data: responseData,
      });
    }
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating sales report',
    });
  }
});

/**
 * Get dashboard statistics
 * @route GET /api/reports/dashboard
 * @access Private/Admin
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    const { timeFilter = 'yearly' } = req.query;

    // Determine date range based on time filter
    const now = new Date();
    let startDate; let
      endDate;

    switch (timeFilter) {
      case 'daily':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'weekly':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'monthly':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'yearly':
      default:
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
    }

    // Get orders within date range
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
      orderStatus: { $ne: 'Cancelled' },
    }).populate('user', 'name email');

    // Calculate total sales and orders
    const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Get unique customers count
    const uniqueCustomers = new Set();
    orders.forEach((order) => {
      if (order.user && order.user._id) {
        uniqueCustomers.add(order.user._id.toString());
      }
    });
    const totalCustomers = uniqueCustomers.size;

    // Prepare sales data based on time filter
    let salesData = [];

    if (timeFilter === 'daily') {
      // Group by hour
      const hourlyData = {};

      for (let i = 0; i < 24; i += 1) {
        const hourLabel = `${i.toString().padStart(2, '0')}:00`;
        hourlyData[hourLabel] = { date: hourLabel, amount: 0, orders: 0 };
      }

      orders.forEach((order) => {
        const hour = new Date(order.createdAt).getHours();
        const hourLabel = `${hour.toString().padStart(2, '0')}:00`;

        if (hourlyData[hourLabel]) {
          hourlyData[hourLabel].amount += order.totalPrice || 0;
          hourlyData[hourLabel].orders += 1;
        }
      });

      salesData = Object.values(hourlyData);
    } else if (timeFilter === 'weekly') {
      // Group by day of week
      const weekdayData = {};
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      weekdays.forEach((day) => {
        weekdayData[day] = { date: day, amount: 0, orders: 0 };
      });

      orders.forEach((order) => {
        const weekday = weekdays[new Date(order.createdAt).getDay()];

        if (weekdayData[weekday]) {
          weekdayData[weekday].amount += order.totalPrice || 0;
          weekdayData[weekday].orders += 1;
        }
      });

      // Reorder to start with Monday
      const orderedWeekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      salesData = orderedWeekdays.map((day) => weekdayData[day]);
    } else if (timeFilter === 'monthly') {
      // Group by day of month
      const daysInMonth = endOfMonth(now).getDate();
      const dailyData = {};

      for (let i = 1; i <= daysInMonth; i += 1) {
        const dayLabel = `Day ${i}`;
        dailyData[dayLabel] = { date: dayLabel, amount: 0, orders: 0 };
      }

      orders.forEach((order) => {
        const day = new Date(order.createdAt).getDate();
        const dayLabel = `Day ${day}`;

        if (dailyData[dayLabel]) {
          dailyData[dayLabel].amount += order.totalPrice || 0;
          dailyData[dayLabel].orders += 1;
        }
      });

      salesData = Object.values(dailyData);
    } else {
      // Group by month for yearly view
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const monthlyData = {};

      monthNames.forEach((month) => {
        monthlyData[month] = { date: month, amount: 0, orders: 0 };
      });

      orders.forEach((order) => {
        const month = new Date(order.createdAt).getMonth();
        const monthName = monthNames[month];

        if (monthlyData[monthName]) {
          monthlyData[monthName].amount += order.totalPrice || 0;
          monthlyData[monthName].orders += 1;
        }
      });

      salesData = Object.values(monthlyData);
    }

    // Return the dashboard data
    res.status(200).json({
      success: true,
      data: {
        totalSales,
        totalOrders,
        totalCustomers,
        averageOrderValue,
        salesData,
      },
    });
  } catch (error) {
    console.error('Error generating dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating dashboard statistics',
    });
  }
});

/**
 * Get payment statistics
 * @route GET /api/reports/payment-stats
 * @access Private/Admin
 */
export const getPaymentStats = asyncHandler(async (req, res) => {
  try {
    const { timeFilter = 'yearly' } = req.query; // Default to yearly, similar to getDashboardStats

    const now = new Date();
    let dateRangeFilter = {};

    switch (timeFilter) {
      case 'daily':
        dateRangeFilter = { $gte: startOfDay(now), $lte: endOfDay(now) };
        break;
      case 'weekly':
        dateRangeFilter = {
          $gte: startOfWeek(now, { weekStartsOn: 1 }),
          $lte: endOfWeek(now, { weekStartsOn: 1 }),
        };
        break;
      case 'monthly':
        dateRangeFilter = { $gte: startOfMonth(now), $lte: endOfMonth(now) };
        break;
      case 'yearly':
      default:
        dateRangeFilter = { $gte: startOfYear(now), $lte: endOfYear(now) };
        break;
    }

    const initialMatchConditions = {
      createdAt: dateRangeFilter,
      paymentMethod: { $exists: true, $ne: null }, // Changed from paymentType
      isPaid: true,
    };

    const aggregationResult = await Order.aggregate([
      { $match: initialMatchConditions },
      {
        $facet: {
          paymentMethodDetails: [
            {
              $group: {
                _id: '$paymentMethod',
                count: { $sum: 1 },
                totalAmount: { $sum: '$totalPrice' },
              },
            },
            { $sort: { count: -1 } }, // Sort by count descending
          ],
          totalMatchingOrders: [
            { $count: 'total' },
          ],
        },
      },
      {
        $project: {
          stats: {
            $ifNull: [ // Handle case where totalMatchingOrders might be empty (no orders match)
              {
                $map: {
                  input: '$paymentMethodDetails',
                  as: 'method',
                  in: {
                    _id: '$$method._id',
                    count: '$$method.count',
                    totalAmount: { $round: ['$$method.totalAmount', 2] },
                    percentage: {
                      $cond: {
                        if: { $gt: [{ $ifNull: [{ $arrayElemAt: ['$totalMatchingOrders.total', 0] }, 0] }, 0] }, // Check if total > 0
                        then: {
                          $round: [
                            { $multiply: [{ $divide: ['$$method.count', { $arrayElemAt: ['$totalMatchingOrders.total', 0] }] }, 100] },
                            2,
                          ],
                        },
                        else: 0, // Avoid division by zero if no matching orders
                      },
                    },
                  },
                },
              },
              [], // Default to empty array if no paymentMethodDetails or totalMatchingOrders
            ],
          },
        },
      },
    ]);

    // The result of the aggregation is an array, potentially empty.
    // If not empty, it contains one document with a 'stats' field.
    const paymentStats = aggregationResult.length > 0 && aggregationResult[0].stats
      ? aggregationResult[0].stats
      : [];

    res.status(200).json({
      success: true,
      data: paymentStats,
    });
  } catch (error) {
    console.error('Error getting payment statistics:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error getting payment statistics',
    });
  }
});

/**
 * Get best sellers (products, categories, or brands)
 * @route GET /api/reports/bestsellers
 * @access Private/Admin
 */
export const getBestSellers = asyncHandler(async (req, res) => {
  try {
    const { category = 'products', limit = 5 } = req.query;

    // Validate category parameter
    if (!['products', 'categories', 'brands'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category parameter. Must be one of: products, categories, brands',
      });
    }

    let result = [];

    if (category === 'products') {
      // Get best selling products
      result = await Order.aggregate([
        // Include all orders except cancelled ones
        { $match: { orderStatus: { $nin: ['Cancelled'] } } },
        // Unwind the order items array
        { $unwind: '$orderItems' },
        // Group by product ID
        {
          $group: {
            _id: '$orderItems.product',
            name: { $first: '$orderItems.name' },
            price: { $first: '$orderItems.price' },
            totalSold: { $sum: '$orderItems.quantity' },
            totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
            totalOrders: { $sum: 1 },
          },
        },
        // Sort by total sold
        { $sort: { totalSold: -1 } },
        // Limit results
        { $limit: parseInt(limit, 10) },
      ]);

      // Populate with additional product info if needed
      if (result.length > 0 && result[0]._id) { // Check if result has _id to process
        const productPromises = result.map(item => {
          if (item._id) {
            return Product.findById(item._id).select('name price image').lean();
          }
          return Promise.resolve(null); // Keep shape for non-product items
        });
        const productsDetails = await Promise.all(productPromises);
        result = result.map((item, index) => {
          const product = productsDetails[index];
          if (product) {
            return {
              ...item,
              name: product.name || item.name,
              price: product.price || item.price,
              image: product.image,
            };
          }
          return item;
        });
      }
    } else if (category === 'categories') {
      // Get best selling categories
      result = await Order.aggregate([
        // Include all orders except cancelled ones
        { $match: { orderStatus: { $nin: ['Cancelled'] } } },
        // Unwind the order items array
        { $unwind: '$orderItems' },
        // Lookup to get product details
        {
          $lookup: {
            from: 'products',
            localField: 'orderItems.product',
            foreignField: '_id',
            as: 'productInfo',
          },
        },
        // Unwind the product info array
        { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
        // Group by category
        {
          $group: {
            _id: '$productInfo.category',
            totalSold: { $sum: '$orderItems.quantity' },
            totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
            totalOrders: { $sum: 1 },
          },
        },
        // Sort by total revenue
        { $sort: { totalRevenue: -1 } },
        // Limit results
        { $limit: parseInt(limit, 10) },
      ]);

      // Populate with category names
      if (result.length > 0 && result[0]._id) { // Check if result has _id to process
        const categoryPromises = result.map(item => {
          if (item._id) {
            return Category.findById(item._id).select('name').lean()
              .catch(() => null); // Handle potential errors during findById
          }
          return Promise.resolve(null); // Keep shape for non-category items
        });
        const categoriesDetails = await Promise.all(categoryPromises);
        result = result.map((item, index) => {
          const categoryDoc = categoriesDetails[index];
          let name = 'Uncategorized'; // Default name
          if (item._id) { // Only try to assign name if there was an _id
            if (categoryDoc && categoryDoc.name) {
              name = categoryDoc.name;
            } else {
              name = 'Unknown Category'; // If _id existed but category not found or no name
            }
          }
          return {
            ...item,
            name,
          };
        });
      }
    } else if (category === 'brands') {
      // Get best selling brands
      result = await Order.aggregate([
        // Include all orders except cancelled ones
        { $match: { orderStatus: { $nin: ['Cancelled'] } } },
        // Unwind the order items array
        { $unwind: '$orderItems' },
        // Lookup to get product details
        {
          $lookup: {
            from: 'products',
            localField: 'orderItems.product',
            foreignField: '_id',
            as: 'productInfo',
          },
        },
        // Unwind the product info array
        { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
        // Group by brand
        {
          $group: {
            _id: '$productInfo.brand',
            totalSold: { $sum: '$orderItems.quantity' },
            totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
            totalOrders: { $sum: 1 },
          },
        },
        // Sort by total revenue
        { $sort: { totalRevenue: -1 } },
        // Limit results
        { $limit: parseInt(limit, 10) },
      ]);

      // Add brand names
      for (let i = 0; i < result.length; i += 1) {
        if (result[i]._id) {
          result[i].name = result[i]._id;
        } else {
          result[i].name = 'Unbranded';
        }
      }
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error getting best sellers:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error getting best sellers',
    });
  }
});
