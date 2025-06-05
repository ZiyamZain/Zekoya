import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const invoicesDir = path.join(__dirname, '../uploads/invoices');
if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir, { recursive: true });
}

export const generateOrderInvoice = async (order) => new Promise((resolve, reject) => {
  try {
    if (!order || !order.orderId) {
      throw new Error('Invalid order data: missing orderId');
    }

    if (!order.orderItems || !Array.isArray(order.orderItems)) {
      throw new Error('Invalid order data: missing or invalid orderItems');
    }

    if (!order.user || !order.user.name) {
      throw new Error('Invalid order data: missing user information');
    }

    const invoicePath = path.join(invoicesDir, `${order.orderId}.pdf`);

    const doc = new PDFDocument({ margin: 50 });

    const stream = fs.createWriteStream(invoicePath);
    doc.pipe(stream);

    doc.fontSize(20).text('Zekoya', 50, 50);
    doc.fontSize(10).text('Premium Fashion Store', 50, 75);
    doc.moveDown();

    doc.fontSize(16).text('INVOICE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice #: ${order.orderId}`);
    doc
      .fontSize(12)
      .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.fontSize(12).text(`Status: ${order.orderStatus}`);
    doc.moveDown();

    doc.fontSize(14).text('Customer Information');
    doc.fontSize(10).text(`Name: ${order.user.name}`);
    doc.fontSize(10).text(`Email: ${order.user.email}`);
    doc.moveDown();

    // Add shipping address
    doc.fontSize(14).text('Shipping Address');
    doc.fontSize(10).text(`${order.shippingAddress.name}`);
    doc.fontSize(10).text(`${order.shippingAddress.address}`);
    doc
      .fontSize(10)
      .text(
        `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`,
      );
    doc.fontSize(10).text(`${order.shippingAddress.country}`);
    doc.fontSize(10).text(`Phone: ${order.shippingAddress.phone}`);
    doc.moveDown();

    // Add order items table
    doc.fontSize(14).text('Order Items');
    doc.moveDown();

    // Table header
    const tableTop = doc.y;
    const itemX = 50;
    const descriptionX = 150;
    const quantityX = 300;
    const priceX = 370;
    const amountX = 450;

    doc
      .fontSize(10)
      .text('Item', itemX, tableTop)
      .text('Description', descriptionX, tableTop)
      .text('Qty', quantityX, tableTop)
      .text('Price', priceX, tableTop)
      .text('Amount', amountX, tableTop);

    // Draw a line
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    // Table rows
    const tableRow = tableTop + 25;

    // Add items
    order.orderItems.forEach((item, i) => {
      // Handle case where product might be null or undefined
      const itemName = item.product ? item.product.name : 'Product';
      const position = tableRow + i * 25;

      doc
        .fontSize(10)
        .text(`${i + 1}`, itemX, position)
        .text(itemName, descriptionX, position)
        .text(item.quantity.toString(), quantityX, position)
        .text(`₹${item.price ? item.price.toFixed(2) : '0.00'}`, priceX, position)
        .text(
          `₹${(item.price && item.quantity) ? (item.price * item.quantity).toFixed(2) : '0.00'}`,
          amountX,
          position,
        );
    });

    // Draw a line
    const summaryTop = tableRow + order.orderItems.length * 25 + 10;
    doc.moveTo(50, summaryTop).lineTo(550, summaryTop).stroke();

    // Add summary
    const summaryX = 350;
    let summaryPosition = summaryTop + 20;

    doc
      .fontSize(10)
      .text('Subtotal:', summaryX, summaryPosition)
      .text(`₹${order.itemsPrice.toFixed(2)}`, amountX, summaryPosition);

    summaryPosition += 15;
    doc
      .text('Tax:', summaryX, summaryPosition)
      .text(`₹${order.taxPrice.toFixed(2)}`, amountX, summaryPosition);

    summaryPosition += 15;
    doc
      .text('Shipping:', summaryX, summaryPosition)
      .text(`₹${order.shippingPrice.toFixed(2)}`, amountX, summaryPosition);

    if (order.discountPrice > 0) {
      summaryPosition += 15;
      doc
        .text('Discount:', summaryX, summaryPosition)
        .text(
          `-₹${order.discountPrice.toFixed(2)}`,
          amountX,
          summaryPosition,
        );
    }

    // Draw a line
    summaryPosition += 15;
    doc
      .moveTo(summaryX, summaryPosition)
      .lineTo(550, summaryPosition)
      .stroke();

    // Add total
    summaryPosition += 15;
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Total:', summaryX, summaryPosition)
      .text(`₹${order.totalPrice.toFixed(2)}`, amountX, summaryPosition);

    // Add footer
    doc
      .fontSize(10)
      .font('Helvetica')
      .text('Thank you for shopping with Zekoya!', 50, 700, {
        align: 'center',
      });

    // Finalize the PDF
    doc.end();

    stream.on('finish', () => {
      resolve({
        path: invoicePath,
        url: `/uploads/invoices/${order.orderId}.pdf`,
      });
    });

    stream.on('error', (err) => {
      console.error(`PDF stream error for order ${order.orderId}:`, err);
      reject(err);
    });
  } catch (error) {
    reject(error);
  }
});
