import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  discountedPrice: {
    type: Number,
  },
  offerDiscount: {
    type: Number,
  },
  offerDetails: {
    name: String,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
    },
    discountValue: Number,
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
    default: 'Pending',
  },
  cancelReason: {
    type: String,
  },
  cancelledAt: {
    type: Date,
  },
  returnReason: {
    type: String,
  },
  returnStatus: {
    type: String,
    enum: ['Requested', 'Accepted', 'Rejected', 'Completed', 'Not Applicable'],
    default: 'Not Applicable',
  },
  returnRequestDate: {
    type: Date,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'Cash on Delivery',
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    discountPrice: {
      type: Number,
      default: 0.0,
    },
    offerDiscountPrice: {
      type: Number,
      default: 0.0,
    },
    couponCode: {
      type: String,
      default: null,
    },
    couponDiscount: {
      type: Number,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    orderStatus: {
      type: String,
      required: true,
      default: 'Pending',
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    cancelledAt: {
      type: Date,
    },
    cancelReason: {
      type: String,
    },
    hasReturnRequest: {
      type: Boolean,
      default: false,
    },
    invoice: {
      type: String,
    },
    statusHistory: [{
      status: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      note: String,
    }],
  },
  {
    timestamps: true,
  },
);

orderSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('orderStatus')) {
    this.statusHistory.push({
      status: this.orderStatus,
      date: new Date(),
      note: this.isNew ? 'Order created' : 'Status updated',
    });
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
