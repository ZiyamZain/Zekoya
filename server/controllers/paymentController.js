import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import asyncHandler from "express-async-handler";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { amount, currency = "INR", receipt, notes } = req.body;
  try {
    const options = {
      amount: amount * 100,
      currency,
      receipt,
      notes,
    };
    const order = await razorpay.orders.create(options);
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong with payment initiation",
      error: error.message,
    });
  }
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;
  try {
    // Log the incoming data for debugging
    console.log("Verifying payment with data:", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    });

    // Verify the payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    console.log("Expected signature:", expectedSignature);
    console.log("Received signature:", razorpay_signature);

    const isAuthentic = expectedSignature === razorpay_signature;
    if (isAuthentic) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: razorpay_payment_id,
        status: "completed",
        update_time: Date.now(),
        email_address: req.user.email,
      };
      await order.save();
      
      // Clear the user's cart after successful payment
      const cart = await Cart.findOne({ user: req.user._id });
      if (cart) {
        cart.items = [];
        await cart.save();
        console.log(`Cart cleared for user ${req.user._id} after successful Razorpay payment`);
      }
      
      res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        order,
      });
    } else {
      console.error("Signature verification failed");
      res.status(400).json({
        success: false,
        message: "Payment verification failed - Invalid signature",
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong with payment verification",
      error: error.message,
    });
  }
});

export const getRazorpayKey = asyncHandler(async (req, res) => {
  res.status(200).json({
    key_id: process.env.RAZORPAY_KEY_ID,
  });
});
