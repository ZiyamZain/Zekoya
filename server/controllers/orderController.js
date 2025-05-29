import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Cart from "../models/cartModel.js";
import Coupon from "../models/couponModel.js";
import fs from "fs";
import {generateOrderInvoice} from '../utils/pdfGenerator.js'


const generateOrderId = () => {
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `ZK-${timestamp}-${random}`;
};


export const createOrder = async (req, res) => {
  try {
    const {
      addressId,
      paymentMethod = "Cash on Delivery",
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountPrice,
      offerDiscountPrice = 0,
      totalPrice,
      couponCode,
      couponDiscount,
      productOffers
    } = req.body;

    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const addressExists = user.addresses.some(
      (addr) => addr._id.toString() === addressId
    );
    if (!addressExists) {
      return res.status(400).json({ message: "Invalid shipping address" });
    }


    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items.product",
      select: "name price images isListed sizes category",
      populate: {
        path: "category",
        select: "name isListed",
      },
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

  
    for (const item of cart.items) {
      const product = item.product;

      if (
        !product ||
        !product.isListed ||
        !product.category ||
        !product.category.isListed
      ) {
        return res.status(400).json({
          message: `Product ${
            product ? product.name : "Unknown"
          } is no longer available`,
        });
      }


      // Check stock availability
      const sizeObj = product.sizes.find((s) => s.size === item.size);
      if (!sizeObj || sizeObj.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock available for ${product.name} (${item.size})`,
        });
      }
    }

    const orderItems = cart.items.map((item) => {
      const itemOffer = productOffers && productOffers[item.product._id];
      
      // Calculate discounted price if offer exists
      let discountedPrice = item.product.price;
      let offerDiscount = 0;
      
      if (itemOffer) {
        if (itemOffer.discountType === 'percentage') {
          offerDiscount = item.product.price * (itemOffer.discountValue / 100);
          discountedPrice = item.product.price - offerDiscount;
        } else {
          offerDiscount = Math.min(itemOffer.discountValue, item.product.price);
          discountedPrice = item.product.price - offerDiscount;
        }
      }
      
      return {
        product: item.product._id,
        size: item.size,
        quantity: item.quantity,
        price: item.product.price,
        discountedPrice: discountedPrice,
        offerDiscount: offerDiscount > 0 ? offerDiscount : undefined,
        offerDetails: itemOffer ? {
          name: itemOffer.name,
          discountType: itemOffer.discountType,
          discountValue: itemOffer.discountValue
        } : undefined,
        status: 'Pending'
      };
    });

    const selectedAddress = user.addresses.find(
      (addr) => addr._id.toString() === addressId
    );

    let validCoupon = null;
    if (couponCode) {
      validCoupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      
      if (!validCoupon) {
        return res.status(400).json({ message: 'Invalid coupon code' });
      }
      
      // Check if coupon is valid for this order
      const validationResult = validCoupon.isValid(itemsPrice);
      if (!validationResult.isValid) {
        return res.status(400).json({ message: validationResult.message });
      }
      

      validCoupon.usageCount += 1;
      await validCoupon.save();
    }
    

    const orderId = generateOrderId();


    if (paymentMethod === "Wallet") {
      if (user.walletBalance < totalPrice) {
        return res.status(400).json({ 
          message: "Insufficient wallet balance",
          walletBalance: user.walletBalance,
          orderTotal: totalPrice
        });
      }

      user.walletBalance -= totalPrice;
y
      user.walletHistory.push({
        type: 'debit',
        amount: totalPrice,
        description: `Payment for order #${orderId}`,
        date: new Date()
      });
      
      await user.save();
    }

    // Create order with payment status
    // For Cash on Delivery and Wallet orders, set different initial states
    const isPaidOnCreation = paymentMethod === "Wallet";
    
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress: {
        name: selectedAddress.name,
        phone: selectedAddress.phone,
        address:
          selectedAddress.addressLine1 +
          (selectedAddress.addressLine2
            ? ", " + selectedAddress.addressLine2
            : ""),
        city: selectedAddress.city,
        state: selectedAddress.state,
        postalCode: selectedAddress.postalCode,
        country: selectedAddress.country,
      },
      paymentMethod,
      itemsPrice:
        itemsPrice ||
        cart.items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        ),
      taxPrice: taxPrice || 0,
      shippingPrice: shippingPrice || 0,
      discountPrice: discountPrice || 0,
      offerDiscountPrice: offerDiscountPrice || 0,
      couponCode: couponCode || null,
      couponDiscount: couponDiscount || 0,
      totalPrice:
        totalPrice ||
        parseFloat(itemsPrice) +
          parseFloat(taxPrice) +
          parseFloat(shippingPrice) -
          parseFloat(discountPrice || 0) -
          parseFloat(offerDiscountPrice || 0),
      isPaid: isPaidOnCreation,
      paidAt: isPaidOnCreation ? new Date() : null,
      orderId,
    });

    // Update the order ID reference in wallet history if it's a wallet payment
    if (paymentMethod === "Wallet") {
      const lastHistoryIndex = user.walletHistory.length - 1;
      if (lastHistoryIndex >= 0) {
        user.walletHistory[lastHistoryIndex].orderId = order._id;
        await user.save();
      }
    }

    // Update product stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (!product) continue;

      const sizeIndex = product.sizes.findIndex((s) => s.size === item.size);

      if (sizeIndex !== -1) {
        product.sizes[sizeIndex].stock -= item.quantity;
        product.totalStock = product.sizes.reduce(
          (total, size) => total + size.stock,
          0
        );
        await product.save();
      }
    }


    if (paymentMethod !== "Razorpay") {
      cart.items = [];
      await cart.save();
    }

    // Return the created order
    const populatedOrder = await Order.findById(order._id).populate({
      path: "orderItems.product",
      select: "name price images",
    });

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate({
      path: "orderItems.product",
      select: "name price images",
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }


    if (order.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this order" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
};


export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "orderItems.product",
        select: "name images",
      });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};



// Cancel entire order
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }

    // Check if order can be cancelled (only Pending or Processing orders can be cancelled)
    if (order.orderStatus !== "Pending" && order.orderStatus !== "Processing") {
      return res.status(400).json({ 
        message: `Order cannot be cancelled in ${order.orderStatus} status` 
      });
    }

    // Update order status
    order.orderStatus = "Cancelled";
    order.cancelReason = reason || "Cancelled by customer";
    order.cancelledAt = new Date();
    
    // Add to status history
    order.statusHistory.push({
      status: "Cancelled",
      date: new Date(),
      note: reason || "Cancelled by customer"
    });

    // Process refund for paid orderrs
    if (order.isPaid && order.paymentMethod !== "Cash on Delivery") {
    
      const user = await User.findById(order.user);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Add refund amount to wallet
      const refundAmount = order.totalPrice;
      user.walletBalance += refundAmount;
      
      // Add transaction to wallet history
      user.walletHistory.push({
        amount: refundAmount,
        type: 'credit',
        description: `Refund for cancelled order #${order.orderId}`,
        orderId: order._id,
        date: new Date()
      });
      
      await user.save();
    }

    // Restore stock for all items
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      
      if (product) {
        // Find the size object
        const sizeObj = product.sizes.find(s => s.size === item.size);
        
        if (sizeObj) {
          // Restore stock
          sizeObj.stock += item.quantity;
          await product.save();
        }
      }
    }

    await order.save();

    res.status(200).json({ 
      message: "Order cancelled successfully",
      order
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Failed to cancel order" });
  }
};

// Cancel specific order item
export const cancelOrderItem = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel items in this order" });
    }

    // Check if order can have items cancelled (only Processing orders)
    if (order.orderStatus !== "Processing") {
      return res.status(400).json({ 
        message: `Items cannot be cancelled in ${order.orderStatus} status` 
      });
    }

    // Find the specific item
    const orderItem = order.orderItems.id(itemId);
    
    if (!orderItem) {
      return res.status(404).json({ message: "Order item not found" });
    }

    // Check if item is already cancelled
    if (orderItem.status === "Cancelled") {
      return res.status(400).json({ message: "Item is already cancelled" });
    }

    // Update item status
    orderItem.status = "Cancelled";
    orderItem.cancelReason = reason || "Cancelled by customer";
    orderItem.cancelledAt = new Date();

    // Restore stock for the cancelled item
    const product = await Product.findById(orderItem.product);
    
    if (product) {
      // Find the size object
      const sizeObj = product.sizes.find(s => s.size === orderItem.size);
      
      if (sizeObj) {
        // Restore stock
        sizeObj.stock += orderItem.quantity;
        await product.save();
      }
    }

    // Recalculate order totals
    const activeItems = order.orderItems.filter(item => item.status !== "Cancelled");
    
    if (activeItems.length === 0) {
      // If all items are cancelled, cancel the entire order
      order.orderStatus = "Cancelled";
      order.cancelReason = "All items cancelled";
      order.cancelledAt = new Date();
      
      // Add to status history
      order.statusHistory.push({
        status: "Cancelled",
        date: new Date(),
        note: "All items cancelled"
      });
    } else {
      // Recalculate prices
      order.itemsPrice = activeItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      // Check if we need to update shipping price based on the new total
      const FREE_SHIPPING_THRESHOLD = 1000;
      if (order.itemsPrice < FREE_SHIPPING_THRESHOLD && order.shippingPrice === 0) {
        // If total drops below threshold and shipping was free, add shipping fee
        order.shippingPrice = 100;
      }
      
      order.totalPrice = order.itemsPrice + order.taxPrice + order.shippingPrice - order.discountPrice;
    }

    await order.save();

    res.status(200).json({ 
      message: "Order item cancelled successfully",
      order
    });
  } catch (error) {
    console.error("Error cancelling order item:", error);
    res.status(500).json({ message: "Failed to cancel order item" });
  }
};

// Request return for delivered item
export const requestReturnItem = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Return reason is required" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to return items in this order" });
    }

    // Check if order is delivered (only delivered orders can have returns)
    if (order.orderStatus !== "Delivered") {
      return res.status(400).json({ 
        message: `Items cannot be returned in ${order.orderStatus} status` 
      });
    }

    // Find the specific item
    const orderItem = order.orderItems.id(itemId);
    
    if (!orderItem) {
      return res.status(404).json({ message: "Order item not found" });
    }

    // Check if item is already returned or has a pending return
    if (orderItem.status === "Returned" || orderItem.returnStatus !== "Not Applicable") {
      return res.status(400).json({ 
        message: "Item already has a return request or has been returned" 
      });
    }

    // Update item status for return request
    orderItem.returnStatus = "Requested";
    orderItem.returnReason = reason;
    orderItem.returnRequestDate = new Date();

    // Update order to indicate it has a return request
    order.hasReturnRequest = true;

    await order.save();

    res.status(200).json({ 
      message: "Return request submitted successfully",
      order
    });
  } catch (error) {
    console.error("Error requesting return:", error);
    res.status(500).json({ message: "Failed to request return" });
  }
};

// Admin: Get all orders with pagination, sorting, filtering
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filtering
    const filter = {};
    
    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }
    
    if (req.query.hasReturnRequest) {
      filter.hasReturnRequest = req.query.hasReturnRequest === 'true';
    }
    
    if (req.query.search) {
      filter.$or = [
        { orderId: { $regex: req.query.search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: req.query.search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Date range filtering
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      filter.createdAt = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      filter.createdAt = { $lte: new Date(req.query.endDate) };
    }
    
    // Sorting
    const sort = {};
    
    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort[sortField] = sortOrder;
    } else {
      // Default sort by createdAt desc (newest first)
      sort.createdAt = -1;
    }
    
    // Count total orders for pagination
    const totalOrders = await Order.countDocuments(filter);
    
    // Get orders
    const orders = await Order.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .populate({
        path: 'orderItems.product',
        select: 'name images'
      });
    
    res.status(200).json({
      orders,
      page,
      pages: Math.ceil(totalOrders / limit),
      total: totalOrders
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// Admin: Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Validate status transition
    const validStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }
    
    // Update status
    order.orderStatus = status;
    
    // Add to status history
    order.statusHistory.push({
      status,
      date: new Date(),
      note: note || `Status updated to ${status}`
    });
    
    // Handle specific status changes
    if (status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    } else if (status === "Cancelled") {
      order.cancelledAt = new Date();
      order.cancelReason = note || "Cancelled by admin";
      
      // Restore stock for all items
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        
        if (product) {
          // Find the size object
          const sizeObj = product.sizes.find(s => s.size === item.size);
          
          if (sizeObj) {
            // Restore stock
            sizeObj.stock += item.quantity;
            await product.save();
          }
        }
      }
    }
    
    await order.save();
    
    res.status(200).json({
      message: "Order status updated successfully",
      order
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

// Admin: Process return request
export const processReturnRequest = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { action, note } = req.body;
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Find the specific item
    const orderItem = order.orderItems.id(itemId);
    
    if (!orderItem) {
      return res.status(404).json({ message: "Order item not found" });
    }
    
    // Check if item has a return request
    if (orderItem.returnStatus !== "Requested") {
      return res.status(400).json({ message: "Item does not have a pending return request" });
    }
    
    if (action === 'approve') {
      // Approve return
      orderItem.returnStatus = "Approved";
      orderItem.status = "Returned";
      
      // Restore stock
      const product = await Product.findById(orderItem.product);
      
      if (product) {
        // Find the size object
        const sizeObj = product.sizes.find(s => s.size === orderItem.size);
        
        if (sizeObj) {
          // Restore stock
          sizeObj.stock += orderItem.quantity;
          await product.save();
        }
      }
      
      // Process refund to wallet
      const refundAmount = orderItem.price * orderItem.quantity;
      
      // Find or create user wallet
      let wallet = await Wallet.findOne({ user: order.user });
      
      if (!wallet) {
        wallet = await Wallet.create({
          user: order.user,
          balance: 0,
          transactions: []
        });
      }
      
      // Add refund transaction
      wallet.transactions.push({
        amount: refundAmount,
        type: 'credit',
        description: `Refund for returned item in order ${order.orderId}`,
        orderId: order._id,
        createdAt: new Date()
      });
      
      // Update balance
      wallet.balance += refundAmount;
      
      await wallet.save();
    } else {
      // Reject return
      orderItem.returnStatus = "Rejected";
    }
    
    // Check if all return requests are processed
    const pendingReturns = order.orderItems.some(item => item.returnStatus === "Requested");
    
    if (!pendingReturns) {
      order.hasReturnRequest = false;
    }
    
    await order.save();
    
    res.status(200).json({
      message: `Return request ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      order
    });
  } catch (error) {
    console.error("Error processing return request:", error);
    res.status(500).json({ message: "Failed to process return request" });
  }
};


export const generateInvoice = async (req, res) => {
  // Flag to track if response has been sent
  let responseSent = false;
  
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate({
        path: 'orderItems.product',
        select: 'name images'
      });
    
    if (!order) {
      responseSent = true;
      return res.status(404).json({ message: "Order not found" });
    }
    
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      responseSent = true;
      return res.status(403).json({ message: "Not authorized to access this order" });
    }
    
    let result;
    try {
      result = await generateOrderInvoice(order);
    } catch (pdfError) {
      console.error("PDF Generation Error:", pdfError);
      responseSent = true;
      return res.status(500).json({ 
        message: "Failed to generate invoice", 
        error: pdfError.message 
      });
    }
    
    if (!result || !result.path) {
      console.error('Invalid PDF generation result:', result);
      responseSent = true;
      return res.status(500).json({ message: "Failed to generate invoice: Invalid result" });
    }
    
    if (!fs.existsSync(result.path)) {
      console.error(`PDF file does not exist at path: ${result.path}`);
      responseSent = true;
      return res.status(500).json({ message: "Failed to generate invoice: File not found" });
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${order.orderId}.pdf"`);
    
    const fileStream = fs.createReadStream(result.path);
    
    fileStream.on('error', (err) => {
      console.error(`Error reading invoice file: ${err.message}`);
      if (!responseSent) {
        responseSent = true;
        res.status(500).json({ message: "Error reading invoice file" });
      }
    });
    

    fileStream.pipe(res);
    
  } catch (error) {
    console.error("Error in invoice generation process:", error);
    if (!responseSent) {
      res.status(500).json({ message: "Failed to generate invoice" });
    }
  }
};
