import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  startOfDay, endOfDay, 
  startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, 
  startOfYear, endOfYear, 
  format as formatDate, 
  subDays, subWeeks, subMonths, subYears,
  parseISO, isValid
} from 'date-fns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const getSalesReport = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate, period, format, page } = req.query;

    // Validate required parameters
    if ((!startDate || !endDate) && !period) {
      return res.status(400).json({
        success: false,
        message: "Either date range or period filter is required",
      });
    }

    // Determine date range based on period or custom dates
    let dateFilter = {};
    const now = new Date();

    if (period) {
      switch (period) {
        case "daily":
          dateFilter = {
            createdAt: {
              $gte: startOfDay(now),
              $lte: endOfDay(now),
            },
          };
          break;
        case "weekly":
          dateFilter = {
            createdAt: {
              $gte: startOfWeek(now, { weekStartsOn: 1 }),
              $lte: endOfWeek(now, { weekStartsOn: 1 }),
            },
          };
          break;
        case "monthly":
          dateFilter = {
            createdAt: {
              $gte: startOfMonth(now),
              $lte: endOfMonth(now),
            },
          };
          break;
        case "yearly":
          dateFilter = {
            createdAt: {
              $gte: startOfYear(now),
              $lte: endOfYear(now),
            },
          };
          break;
        case "last7days":
          dateFilter = {
            createdAt: {
              $gte: subDays(now, 7),
              $lte: now,
            },
          };
          break;
        case "last30days":
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
            message: "Invalid period specified",
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
    const pageValue = parseInt(page) || 1;
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
          totalItemsAgg: { $sum: { $sum: "$orderItems.quantity" } },
          subtotalAmountAgg: { $sum: { $ifNull: ["$itemsPrice", 0] } },
          totalTaxAgg: { $sum: { $ifNull: ["$taxPrice", 0] } },
          totalShippingAgg: { $sum: { $ifNull: ["$shippingPrice", 0] } },
          totalCouponDiscountAgg: { $sum: { $ifNull: ["$couponDiscount", 0] } },
          // Assuming order.discountPrice is product/category offer discount, separate from coupon.
          totalProductOfferDiscountAgg: {
            $sum: { $ifNull: ["$discountPrice", 0] },
          },
          totalRevenueAgg: { $sum: { $ifNull: ["$totalPrice", 0] } },
        },
      },
    ];
    const summaryResultsArray = await Order.aggregate(summaryPipeline);
    const periodSummary =
      summaryResultsArray.length > 0
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
          _id: "$paymentMethod",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalPrice" },
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
            : "0.00",
      })
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
      const date = formatDate(new Date(order.createdAt), "yyyy-MM-dd");

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
        0
      );
      dailySales[date].revenue += order.totalPrice;
      dailySales[date].discount += order.discountPrice || 0;
      dailySales[date].couponDiscount += order.couponDiscount || 0;
      dailySales[date].productDiscount +=
        (order.discountPrice || 0) - (order.couponDiscount || 0);
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
          if (typeof item.product.category === "string") {
            category = item.product.category;
          } else if (item.product.category && item.product.category.toString) {
            category = item.product.category.toString();
          } else {
            category = "Uncategorized";
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
          if (typeof item.product.brand === "string") {
            brand = item.product.brand;
          } else if (item.product.brand && item.product.brand.toString) {
            brand = item.product.brand.toString();
          } else {
            brand = "Unbranded";
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
    const processedOrders = orders.map(order => ({
      _id: order._id,
      orderId: order.orderId || order._id.toString().substring(0, 8) + '...',
      user: order.user ? {
        _id: order.user._id,
        name: order.user.name,
        email: order.user.email
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
      itemCount: (order.orderItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0)
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
        totalDiscount: (periodSummary.totalProductOfferDiscountAgg || 0) + (periodSummary.totalCouponDiscountAgg || 0),
        totalRevenue: periodSummary.totalRevenueAgg || 0,
        averageOrderValue: totalOrders > 0 ? (periodSummary.totalRevenueAgg / totalOrders) : 0,
        paymentMethods: newPaymentMethodsArray
      },
      dailySales: dailySalesArray,
      categorySales: categorySalesArray,
      brandSales: brandSalesArray,
      productSales: productSalesArray,
      orders: processedOrders,
      pagination: {
        total: totalOrders,
        pages: totalPages,
        totalPages: totalPages, // Add totalPages to match frontend expectation
        page: pageValue,
        hasNextPage: pageValue < totalPages,
        hasPreviousPage: pageValue > 1
      }
    };

    
    if (format === "excel") {
     
      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sales Report");

      // Add headers with styling
      const headerRow = worksheet.addRow([
        'Order ID', 'Date', 'Customer', 'Items', 'Amount', 'Discount', 'Total', 'Status', 'Payment Method'
      ]);
      
      // Style header row
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2c3e50' }
      };
      headerRow.eachCell((cell) => {
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
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
          formatDate(new Date(order.createdAt), "yyyy-MM-dd"),
          order.user?.name || "Guest",
          order.itemCount,
          order.itemsPrice || 0,
          (order.discountPrice || 0) + (order.couponDiscount || 0),
          order.totalPrice || 0,
          order.orderStatus || 'N/A',
          order.paymentMethod || 'N/A'
        ]);
        
        // Format numbers with 2 decimal places
        row.getCell(5).numFmt = '0.00';
        row.getCell(6).numFmt = '0.00';
        row.getCell(7).numFmt = '0.00';
      });
      
      // Auto-fit columns
      worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 0;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(maxLength + 2, 30);
      });

      // Set response headers for Excel download
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=sales-report-${Date.now()}.xlsx`
      );

      try {
        // Write the workbook to the response
        
        const buffer = await workbook.xlsx.writeBuffer();
       
        return res.send(buffer);
      } catch (error) {
        console.error('Error generating Excel:', error);
        return res.status(500).json({
          success: false,
          message: 'Error generating Excel report'
        });
      }
    } else if (format === "pdf") {
      
      try {
        // Create a new PDF document with better margins
        const doc = new PDFDocument({
          margin: 40,
          size: "A4",
          layout: "portrait",
          bufferPages: true
        });

        // Set response headers for PDF download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=sales-report-${Date.now()}.pdf`
        );

        // Create a buffer to collect the PDF data
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => {
          const result = Buffer.concat(chunks);
    
          res.end(result);
        });
        
        // Pipe the PDF to the response
        doc.pipe(res);

      // Add logo and header
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .fillColor("#2c3e50")
        .text("SALES REPORT", { align: "center" });

      // Add date range
      doc
        .fontSize(10)
        .fillColor("#7f8c8d")
        .text(
          `Date Range: ${formatDate(
            new Date(startDate),
            "dd MMM yyyy"
          )} - ${formatDate(new Date(endDate), "dd MMM yyyy")}`,
          { align: "center", lineGap: 20 }
        );

      // Add summary section with better styling
      doc
        .fontSize(14)
        .fillColor("#2c3e50")
        .text("SUMMARY", { underline: true });

      // Summary box
      const summaryY = doc.y + 10;
      doc.roundedRect(40, summaryY, doc.page.width - 80, 80, 5).fill("#f8f9fa");

      // Summary content
      const summaryItems = [
        { label: "Total Orders", value: responseData.summary.totalOrders },
        {
          label: "Total Revenue",
          value: `₹${responseData.summary.totalRevenue.toFixed(2)}`,
        },
        {
          label: "Total Discount",
          value: `₹${responseData.summary.totalDiscount.toFixed(2)}`,
        },
        {
          label: "Avg. Order Value",
          value: `₹${responseData.summary.averageOrderValue.toFixed(2)}`,
        },
      ];

      const summaryCol1X = 60;
      const summaryCol2X = 250;
      let currentY = summaryY + 20;

      summaryItems.forEach((item, index) => {
        const x = index % 2 === 0 ? summaryCol1X : summaryCol2X;
        if (index % 2 === 0 && index > 0) currentY += 25;

        doc
          .fontSize(10)
          .fillColor("#7f8c8d")
          .text(`${item.label}:`, x, currentY);

        doc
          .fontSize(12)
          .fillColor("#2c3e50")
          .text(item.value, x + 100, currentY);
      });

      // Orders section
      const ordersY = currentY + 30;
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#2c3e50")
        .text("ORDER DETAILS", 40, ordersY, {
          underline: false,
          align: "left",
          lineGap: 10,
        });

      // Table headers and layout
      const tableTop = ordersY + 20;
      const leftMargin = 40;
      const rowHeight = 20;
      const colWidths = [90, 70, 150, 80, 80];
      const headerHeight = 25;
      const footerHeight = 30;

      // Calculate available rows per page
      const availableHeight =
        doc.page.height - tableTop - headerHeight - footerHeight - 20;
      const rowsPerPage = 7; // Match the limit for consistency

      // Split orders into chunks that fit on each page
      const allOrders = responseData.orders;
      const orderChunks = [];
      for (let i = 0; i < allOrders.length; i += rowsPerPage) {
        orderChunks.push(allOrders.slice(i, i + rowsPerPage));
      }

      // If no orders, add an empty chunk to show the table header
      if (orderChunks.length === 0) {
        orderChunks.push([]);
      }

      // Process each page of orders
      orderChunks.forEach((tableRows, pageIndex) => {
        // Add new page for all chunks after the first one
        if (pageIndex > 0) {
          doc.addPage();
          // Reset Y position for the new page
          currentY = 50;
          
          // Add header for subsequent pages
          doc
            .fontSize(24)
            .font('Helvetica-Bold')
            .fillColor('#2c3e50')
            .text('SALES REPORT (CONTINUED)', { align: 'center' });
            
          // Add date range for subsequent pages
          doc
            .fontSize(10)
            .fillColor('#7f8c8d')
            .text(
              `Date Range: ${formatDate(new Date(startDate), 'dd MMM yyyy')} - ${formatDate(new Date(endDate), 'dd MMM yyyy')}`,
              { align: 'center', lineGap: 20 }
            );
        }

        // Draw table header
        doc
          .roundedRect(leftMargin, currentY, doc.page.width - 80, rowHeight, 3)
          .fill("#2c3e50");

        let currentX = leftMargin + 5;
        const headers = ["Order ID", "Date", "Customer", "Amount", "Status"];
        headers.forEach((header, i) => {
          doc
            .fontSize(10)
            .fillColor("#ffffff")
            .text(header, currentX, currentY + 5, { width: colWidths[i] - 10 });
          currentX += colWidths[i];
        });

        // Draw table rows for current page
        let currentTableY = currentY + rowHeight;
        tableRows.forEach((order, index) => {
          const rowY = currentTableY + index * rowHeight;

          // Alternate row colors
          if (index % 2 === 0) {
            doc
              .fillColor("#f8f9fa")
              .rect(leftMargin, rowY, doc.page.width - 80, rowHeight)
              .fill();
          }

          // Draw cell borders
          doc
            .strokeColor("#e0e0e0")
            .lineWidth(0.5)
            .moveTo(leftMargin, rowY + rowHeight)
            .lineTo(leftMargin + doc.page.width - 80, rowY + rowHeight)
            .stroke();

          // Order ID
          doc
            .fontSize(8)
            .fillColor("#2c3e50")
            .text(
              (order.orderId || order._id).toString().substring(0, 8) + "...",
              leftMargin + 5,
              rowY + 5,
              { width: colWidths[0] - 10, lineGap: 2 }
            );

          // Date
          doc
            .fontSize(8)
            .fillColor("#2c3e50")
            .text(
              formatDate(new Date(order.createdAt), "dd MMM yy"),
              leftMargin + colWidths[0] + 5,
              rowY + 5,
              { width: colWidths[1] - 10 }
            );

          // Customer
          doc
            .fontSize(8)
            .fillColor("#2c3e50")
            .text(
              order.user?.name || "Guest",
              leftMargin + colWidths[0] + colWidths[3] + 10,
              rowY + 10,
              { width: colWidths[3] - 10, ellipsis: true }
            );

          // Amount - Show final amount after all discounts
          const finalAmount =
            (order.totalPrice || 0) - (order.discountPrice || 0);
          doc
            .fontSize(8)
            .fillColor("#2c3e50")
            .text(
              `₹${finalAmount.toFixed(2)}`,
              leftMargin + colWidths[0] + colWidths[1] + colWidths[2] - 5,
              rowY + 5,
              { width: colWidths[3] + 10, align: "left" }
            );

          // Status with colored pill - Adjust positioning
          const status = order.orderStatus.toLowerCase();
          const statusColors = {
            completed: "#2ecc71",
            processing: "#3498db",
            shipped: "#9b59b6",
            delivered: "#27ae60",
            cancelled: "#e74c3c",
            pending: "#f39c12",
          };

          const statusBg = statusColors[status] || "#95a5a6";
          const statusText = status.charAt(0).toUpperCase() + status.slice(1);

          doc
            .roundedRect(
              leftMargin +
                colWidths[0] +
                colWidths[1] +
                colWidths[2] +
                colWidths[3] +
                10,
              rowY + 2,
              colWidths[4] - 20,
              15,
              7.5
            )
            .fill(statusBg);

          doc
            .fontSize(7)
            .fillColor("#ffffff")
            .text(
              statusText,
              leftMargin +
                colWidths[0] +
                colWidths[1] +
                colWidths[2] +
                colWidths[3] +
                10,
              rowY + 5.5,
              { width: colWidths[4] - 20, align: "center" }
            );
        });
      });

      // Add page numbers to all pages
      const pageCount = orderChunks.length;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(8)
          .fillColor("#95a5a6")
          .text(
            `Page ${i + 1} of ${pageCount}`,
            doc.page.width - 50,
            doc.page.height - 20
          );
      }

      // Add pagination footer to PDF
      const totalOrders = responseData.pagination.total;
      const totalPages = responseData.pagination.totalPages;
      const currentPage = responseData.pagination.currentPage;

      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);

        // Current page indicator
        doc
          .fontSize(10)
          .fillColor("#666")
          .text(
            `Page ${currentPage} of ${totalPages}`,
            doc.page.width / 2 - 30,
            doc.page.height - 20,
            { align: "center" }
          );

        // Pagination info
        const startItem = (currentPage - 1) * rowsPerPage + 1;
        const endItem = Math.min(currentPage * rowsPerPage, totalOrders);

        doc
          .fontSize(10)
          .fillColor("#666")
          .text(
            `Showing ${startItem}-${endItem} of ${totalOrders} orders`,
            doc.page.width - 50,
            doc.page.height - 20,
            { align: "right" }
          );

        // Add navigation text if there are more pages
        if (currentPage < totalPages) {
          doc
            .fontSize(10)
            .fillColor("#3498db")
            .text("Next Page", doc.page.width - 50, doc.page.height - 40, {
              align: "right",
              link: `?page=${parseInt(currentPage) + 1}`,
            });
        }

        if (currentPage > 1) {
          doc
            .fontSize(10)
            .fillColor("#3498db")
            .text("Previous Page", 50, doc.page.height - 40, {
              align: "left",
              link: `?page=${parseInt(currentPage) - 1}`,
            });
        }
      }

      // Finalize the PDF and end the stream
      doc.end();
      } catch (error) {
        console.error('Error generating PDF:', error);
        return res.status(500).json({
          success: false,
          message: 'Error generating PDF report'
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
    let startDate, endDate;
    
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
      orderStatus: { $ne: 'Cancelled' }
    }).populate('user', 'name email');
    
    // Calculate total sales and orders
    const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    // Get unique customers count
    const uniqueCustomers = new Set();
    orders.forEach(order => {
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
      
      for (let i = 0; i < 24; i++) {
        const hourLabel = `${i.toString().padStart(2, '0')}:00`;
        hourlyData[hourLabel] = { date: hourLabel, amount: 0, orders: 0 };
      }
      
      orders.forEach(order => {
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
      
      weekdays.forEach(day => {
        weekdayData[day] = { date: day, amount: 0, orders: 0 };
      });
      
      orders.forEach(order => {
        const weekday = weekdays[new Date(order.createdAt).getDay()];
        
        if (weekdayData[weekday]) {
          weekdayData[weekday].amount += order.totalPrice || 0;
          weekdayData[weekday].orders += 1;
        }
      });
      
      // Reorder to start with Monday
      const orderedWeekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      salesData = orderedWeekdays.map(day => weekdayData[day]);
    } else if (timeFilter === 'monthly') {
      // Group by day of month
      const daysInMonth = endOfMonth(now).getDate();
      const dailyData = {};
      
      for (let i = 1; i <= daysInMonth; i++) {
        const dayLabel = `Day ${i}`;
        dailyData[dayLabel] = { date: dayLabel, amount: 0, orders: 0 };
      }
      
      orders.forEach(order => {
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
      
      monthNames.forEach(month => {
        monthlyData[month] = { date: month, amount: 0, orders: 0 };
      });
      
      orders.forEach(order => {
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
        salesData
      }
    });
  } catch (error) {
    console.error('Error generating dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating dashboard statistics'
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
        dateRangeFilter = { $gte: startOfWeek(now, { weekStartsOn: 1 }), $lte: endOfWeek(now, { weekStartsOn: 1 }) };
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
      isPaid: true
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
                totalAmount: { $sum: '$totalPrice' }
              }
            },
            { $sort: { count: -1 } } // Sort by count descending
          ],
          totalMatchingOrders: [
            { $count: 'total' }
          ]
        }
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
                            2
                          ]
                        },
                        else: 0 // Avoid division by zero if no matching orders
                      }
                    }
                  }
                }
              },
              [] // Default to empty array if no paymentMethodDetails or totalMatchingOrders
            ]
          }
        }
      }
    ]);

    // The result of the aggregation is an array, potentially empty.
    // If not empty, it contains one document with a 'stats' field.
    const paymentStats = aggregationResult.length > 0 && aggregationResult[0].stats ? aggregationResult[0].stats : [];

    res.status(200).json({
      success: true,
      data: paymentStats
    });

  } catch (error) {
    console.error('Error getting payment statistics:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error getting payment statistics'
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
        message: 'Invalid category parameter. Must be one of: products, categories, brands'
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
            totalOrders: { $sum: 1 }
          }
        },
        // Sort by total sold
        { $sort: { totalSold: -1 } },
        // Limit results
        { $limit: parseInt(limit) }
      ]);
      
      // Populate with additional product info if needed
      for (let i = 0; i < result.length; i++) {
        if (result[i]._id) {
          const product = await Product.findById(result[i]._id).select('name price image');
          if (product) {
            result[i].name = product.name || result[i].name;
            result[i].price = product.price || result[i].price;
            result[i].image = product.image;
          }
        }
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
            as: 'productInfo'
          }
        },
        // Unwind the product info array
        { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
        // Group by category
        {
          $group: {
            _id: '$productInfo.category',
            totalSold: { $sum: '$orderItems.quantity' },
            totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
            totalOrders: { $sum: 1 }
          }
        },
        // Sort by total revenue
        { $sort: { totalRevenue: -1 } },
        // Limit results
        { $limit: parseInt(limit) }
      ]);
      
      // Populate with category names
      for (let i = 0; i < result.length; i++) {
        if (result[i]._id) {
          try {
            const category = await Category.findById(result[i]._id).select('name');
            if (category) {
              result[i].name = category.name;
            } else {
              result[i].name = 'Unknown Category';
            }
          } catch (err) {
            result[i].name = 'Unknown Category';
          }
        } else {
          result[i].name = 'Uncategorized';
        }
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
            as: 'productInfo'
          }
        },
        // Unwind the product info array
        { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
        // Group by brand
        {
          $group: {
            _id: '$productInfo.brand',
            totalSold: { $sum: '$orderItems.quantity' },
            totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
            totalOrders: { $sum: 1 }
          }
        },
        // Sort by total revenue
        { $sort: { totalRevenue: -1 } },
        // Limit results
        { $limit: parseInt(limit) }
      ]);
      
      // Add brand names
      for (let i = 0; i < result.length; i++) {
        if (result[i]._id) {
          result[i].name = result[i]._id;
        } else {
          result[i].name = 'Unbranded';
        }
      }
    }
    
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting best sellers:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error getting best sellers'
    });
  }
});
