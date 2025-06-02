import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import fs from 'fs';
import {generateOrderInvoice} from '../utils/pdfGenerator.js';

export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder || "desc";
    const search = req.query.search || "";
    const status = req.query.status || "";
    const dateFilter = req.query.dateFilter || "";
    const priceMin = req.query.priceMin ? parseFloat(req.query.priceMin) : null;
    const priceMax = req.query.priceMax ? parseFloat(req.query.priceMax) : null;

    const query = {};
    

    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { "user.name": { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.orderStatus = status;
    }
    
    if (dateFilter) {
      const now = new Date();
      let startDate;
      
      switch(dateFilter) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          query.createdAt = { $gte: startDate };
          break;
        case 'yesterday':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          startDate.setDate(startDate.getDate() - 1);
          const endDate = new Date(now.setHours(0, 0, 0, 0));
          query.createdAt = { $gte: startDate, $lt: endDate };
          break;
        case 'week':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          startDate.setDate(startDate.getDate() - startDate.getDay());
          query.createdAt = { $gte: startDate };
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          query.createdAt = { $gte: startDate };
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          query.createdAt = { $gte: startDate };
          break;
      }
    }
    

    if (priceMin !== null || priceMax !== null) {
      query.totalPrice = {};
      if (priceMin !== null) query.totalPrice.$gte = priceMin;
      if (priceMax !== null) query.totalPrice.$lte = priceMax;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate("user", "name email");

    const processedOrders = orders.map(order => {
      const orderObj = order.toObject();
      // Check if any items have return requests
      const hasReturnRequests = orderObj.orderItems && 
        orderObj.orderItems.some(item => item.returnRequested);
      return { ...orderObj, hasReturnRequests };
    });

    const total = await Order.countDocuments(query);
    const pages = Math.ceil(total / limit);

    res.json({
      orders: processedOrders,
      page,
      pages,
      total,
    });
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get order by ID (admin)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'orderItems.product',
        select: 'name images price countInStock'
      });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error in getOrderById:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (status === "Cancelled" && order.orderStatus !== "Cancelled") {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          // Find the size and update stock
          const sizeIndex = product.sizes.findIndex(s => s.size === item.size);
          if (sizeIndex !== -1) {
            product.sizes[sizeIndex].stock += item.quantity;
            product.totalStock = product.sizes.reduce((total, size) => total + size.stock, 0);
            await product.save();
          }
        }
      }
    }

    if (order.orderStatus === "Cancelled" && status !== "Cancelled") {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          // Find the size and update stock
          const sizeIndex = product.sizes.findIndex(s => s.size === item.size);
          if (sizeIndex !== -1) {
            product.sizes[sizeIndex].stock -= item.quantity;
            product.totalStock = product.sizes.reduce((total, size) => total + size.stock, 0);
            await product.save();
          }
        }
      }
    }

    // Update order status
    order.orderStatus = status;

    if(order.paymentMethod=== "Cash on Delivery" && status === "Delivered"){
      order.isPaid = true;
      order.paidAt = new Date();
    }
    
    // Add a note to the status history if provided
    if (note) {
      order.statusHistory.push({
        status,
        date: new Date(),
        note
      });
    }
    
    await order.save();

    res.json(order);
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Process return request (admin)
export const processReturnRequest = async (req, res) => {
  try {
    
    const { orderId, itemId } = req.params;
    const { action } = req.body;

    if (!action) {
      console.error('No action provided in request body');
      return res.status(400).json({ message: "Action is required (accept or reject)" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      console.error(`Order not found with ID: ${orderId}`);
      return res.status(404).json({ message: "Order not found" });
    }
    const orderItem = order.orderItems.find(
      (item) => item._id.toString() === itemId
    );

    if (!orderItem) {
      console.error(`Order item not found with ID: ${itemId}`);
      return res.status(404).json({ message: "Order item not found" });
    }


    if (orderItem.returnStatus !== 'Requested') {
      console.error(`No return request for this item. Current status: ${orderItem.returnStatus}`);
      return res
        .status(400)
        .json({ message: "No return request for this item" });
    }

    if (action === "accept") {
      try {
        const product = await Product.findById(orderItem.product);
        
        if (product) {


          const sizeIndex = product.sizes.findIndex(s => s.size === orderItem.size);
          
          if (sizeIndex !== -1) {
            product.sizes[sizeIndex].stock += orderItem.quantity;
            product.totalStock = product.sizes.reduce((total, size) => total + size.stock, 0);
            await product.save();
          } else {
            console.error('Size not found in product:', orderItem.size);
          }
        } else {
          console.error('Product not found with ID:', orderItem.product);
        }


        orderItem.returnStatus = "Accepted";
        
        orderItem.status = "Returned";
        

        const refundAmount = orderItem.price * orderItem.quantity;
        
        try {

          const user = await User.findById(order.user);
          
          if (!user) {
            throw new Error(`User not found for refund: ${order.user}`);
          }

          if (typeof user.walletBalance === 'undefined') {
            user.walletBalance = 0;
          }
          if (!Array.isArray(user.walletHistory)) {
            user.walletHistory = [];
          }

          // Check if this refund has already been processed
          const refundAlreadyProcessed = user.walletHistory.some(
            transaction => 
              transaction.type === 'credit' && 
              transaction.orderId && 
              transaction.orderId.toString() === order._id.toString() && 
              transaction.description.includes(orderItem._id.toString())
          );

          if (refundAlreadyProcessed) {

            order.walletUpdateSuccess = true;
            order.walletUpdateNote = 'Refund already processed for this item';
          } else {
            user.walletBalance += refundAmount;

            
            const transaction = {
              type: "credit",
              amount: refundAmount,
              description: `Refund for order ${order.orderId} - ${orderItem.name || 'Item'} (Return) - Item ID: ${orderItem._id}`,
              date: new Date(),
              orderId: order._id
            };
            user.walletHistory.push(transaction);
            
            await user.save();

            order.walletUpdateSuccess = true;
            order.walletUpdateError = null;
          }

          order.walletUpdateSuccess = true;
          order.walletUpdateError = null;

        } catch (error) {
          console.error('Error processing return request:', error);
          if (error.message.includes('wallet')) {
            order.walletUpdateSuccess = false;
            order.walletUpdateError = error.message;
          }
          throw error;
        }
      } catch (acceptError) {
        console.error('Error accepting return request:', acceptError);
        return res.status(500).json({ message: "Error accepting return request", error: acceptError.message });
      }
    } else if (action === "reject") {
      try {
        orderItem.returnStatus = "Rejected";
      } catch (rejectError) {
        console.error('Error rejecting return request:', rejectError);
        return res.status(500).json({ message: "Error rejecting return request", error: rejectError.message });
      }
    } else {
      console.error('Invalid action provided:', action);
      return res.status(400).json({ message: "Invalid action" });
    }

    try {

      const pendingReturns = order.orderItems.some(item => item.returnStatus === 'Requested');
      if (!pendingReturns) {
        order.hasReturnRequest = false;
      }
      await order.save();

      let responseData = {
        message: `Return request ${action === 'accept' ? 'accepted' : 'rejected'} successfully`,
        order
      };

      if (action === 'accept') {
        const user = await User.findById(order.user);
        if (user) {
          responseData.user = user;
        }
      }

      res.json(responseData);
    } catch (saveError) {
      console.error('Error saving order:', saveError);
      return res.status(500).json({ message: "Error saving order", error: saveError.message });
    }
  } catch (error) {
    console.error("Error in processReturnRequest:", error);
    res.status(500).json({ message: "Server error" });
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
