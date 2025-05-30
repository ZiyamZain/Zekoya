import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderDetails, resetOrder, cancelOrder, cancelOrderItem, requestReturnItem, generateInvoice, updateOrderToPaid } from '../../features/order/orderSlice';
import { createPaymentOrder, verifyPayment, getRazorpayKey } from '../../features/payment/paymentSlice';
import { FaArrowLeft, FaMapMarkerAlt, FaPhone, FaTruck, FaFileInvoice, FaTimesCircle, FaUndo } from 'react-icons/fa';
import customToast from '../../utils/toast';
import CancellationModal from '../../components/CancellationModal';
import ReturnRequestForm from '../../components/ReturnRequestForm';

const OrderDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [cancellingFullOrder, setCancellingFullOrder] = useState(false);
  const [isRetryingPayment, setIsRetryingPayment] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

  const { userInfo } = useSelector((state) => state.userAuth);
  const { order, isLoading, isError, message } = useSelector((state) => state.order);
  
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          setIsRazorpayLoaded(true);
          return resolve(true);
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
         
          setIsRazorpayLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          console.error('Failed to load Razorpay SDK');
          setIsRazorpayLoaded(false);
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpay();

    return () => {
      // Cleanup if needed
    };
  }, []);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    dispatch(getOrderDetails(id));
    
    return () => {
      dispatch(resetOrder());
    };
  }, [dispatch, id, navigate, userInfo]);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleCancelFullOrder = () => {
    setCancellingFullOrder(true);
    setShowCancelModal(true);
  };
  
  const openCancelItemModal = (itemId) => {
    setSelectedItemId(itemId);
    setCancellingFullOrder(false);
    setShowCancelModal(true);
  };
  
  const openReturnModal = (itemId) => {
    setSelectedItemId(itemId);
    setShowReturnModal(true);
  };
  
  const handleCancelConfirm = (reason) => {
    if (cancellingFullOrder) {
      dispatch(cancelOrder({ orderId: id, reason }))
        .unwrap()
        .then(() => {
          customToast.success('Order cancelled successfully');
          setShowCancelModal(false);
          dispatch(getOrderDetails(id));
        })
        .catch((error) => {
          customToast.error(error || 'Failed to cancel order');
        });
    } else {
      dispatch(cancelOrderItem({ orderId: id, itemId: selectedItemId, reason }))
        .unwrap()
        .then(() => {
          customToast.success('Item cancelled successfully');
          setShowCancelModal(false);
          dispatch(getOrderDetails(id));
        })
        .catch((error) => {
          customToast.error(error || 'Failed to cancel item');
        });
    }
  };
  
  const handleReturnConfirm = async (returnReason) => {
    try {
      await dispatch(requestReturnItem({ orderId: id, itemId: selectedItemId, returnReason })).unwrap();
      customToast.success('Return request submitted successfully');
      setShowReturnModal(false);
      await dispatch(getOrderDetails(id));
    } catch (error) {
      customToast.error(error.message || 'Failed to submit return request');
    }
  };

  
  const loadRazorpay = useCallback(() => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        setIsRazorpayLoaded(true);
        return resolve(true);
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {

        setIsRazorpayLoaded(true);
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay SDK');
        setIsRazorpayLoaded(false);
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }, []);

  const handleRetryPayment = async () => {
    if (!order) {
      console.error('No order found');
      customToast.error('Order information is missing');
      return;
    }
    
    try {
    
      setIsRetryingPayment(true);
      
      // 1. Get Razorpay key

      let keyResponse;
      try {
        keyResponse = await dispatch(getRazorpayKey()).unwrap();
        
      } catch (keyError) {
        console.error('Error getting Razorpay key:', {
          error: keyError,
          response: keyError?.response?.data
        });
        throw new Error('Failed to get payment gateway key. Please try again.');
      }
      
      if (!keyResponse || !keyResponse.key_id) {
        console.error('Invalid key response:', keyResponse);
        throw new Error('Invalid payment gateway configuration');
      }
      
      // 2. Create a new Razorpay order
      // Note: Backend will handle the conversion to paise
      const amount = Math.round(order.totalPrice);
     
      
      let orderResponse;
      // Generate a shorter receipt ID to stay within Razorpay's 40-char limit
      // Format: 'ord_' + first 8 chars of order ID + last 4 digits of timestamp
      const shortOrderId = order._id.toString().substring(0, 8);
      const timestamp = Date.now().toString().slice(-4);
      const receiptId = `ord_${shortOrderId}${timestamp}`;
      
      const paymentOrderData = {
        amount: amount,
        currency: 'INR',
        receipt: receiptId,
        notes: {
          orderId: order._id,
          userId: userInfo?._id
        }
      };
      
      
      
      try {
        const actionResult = dispatch(createPaymentOrder(paymentOrderData));
        
        orderResponse = await actionResult.unwrap();
       
      } catch (orderError) {
        console.error('Error creating payment order:', {
          name: orderError.name,
          message: orderError.message,
          stack: orderError.stack,
          response: {
            status: orderError.response?.status,
            statusText: orderError.response?.statusText,
            data: orderError.response?.data,
            headers: orderError.response?.headers
          },
          request: {
            url: orderError.request?.responseURL,
            method: orderError.config?.method,
            data: orderError.config?.data
          },
          config: {
            url: orderError.config?.url,
            method: orderError.config?.method,
            headers: orderError.config?.headers,
            data: orderError.config?.data
          }
        });
        
        const errorMessage = orderError.response?.data?.message || 
                          orderError.message || 
                          'Failed to create payment order. Please try again.';
        throw new Error(errorMessage);
      }
      
      if (!orderResponse || !orderResponse.order) {
        console.error('Invalid order response:', orderResponse);
        throw new Error('Invalid response from payment gateway');
      }
      
      // 3. Ensure Razorpay is loaded
      if (!isRazorpayLoaded) {
        console.error('Razorpay SDK not loaded');
        // Try to load it dynamically
        const loadSuccess = await loadRazorpay();
        if (!loadSuccess) {
          throw new Error('Payment gateway not available. Please check your internet connection and try again.');
        }
      }
      
      if (typeof window.Razorpay === 'undefined') {
        throw new Error('Payment gateway initialization failed. Please try again.');
      }
      
      const options = {
        key: keyResponse.key_id,
        amount: amount,
        currency: 'INR',
        name: 'Zekoya',
        description: `Order #${order.orderId}`,
        order_id: orderResponse.order.id,
        handler: async function (response) {
          try {
            
            
            // 4. Verify the payment
            const verifyResult = await dispatch(verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id
            })).unwrap();
            
           
            
            // 5. Refresh order details to get the updated status
            await dispatch(getOrderDetails(id));
            
            customToast.success('Payment successful! Your order has been confirmed.');
          } catch (error) {
            console.error('Payment verification failed:', {
              error: error.message,
              stack: error.stack,
              response: error.response?.data
            });
            customToast.error(error.message || 'Payment verification failed. Please contact support.');
          } finally {
            setIsRetryingPayment(false);
          }
        },
        prefill: {
          name: userInfo?.name || '',
          email: userInfo?.email || '',
          contact: userInfo?.phone || ''
        },
        theme: {
          color: '#4F46E5'
        },
        modal: {
          ondismiss: function() {
   
            setIsRetryingPayment(false);
          }
        }
      };

      
      try {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          console.error('Payment failed:', response.error);
          customToast.error(`Payment failed: ${response.error?.description || 'Please try again or contact support'}`);
          setIsRetryingPayment(false);
        });
        
        rzp.open();
      } catch (rzpError) {
        console.error('Error initializing Razorpay:', rzpError);
        throw new Error('Failed to initialize payment gateway. Please try again.');
      }

    } catch (error) {
      console.error('Error in handleRetryPayment:', {
        error: error.message,
        stack: error.stack,
        response: error.response?.data,
        name: error.name,
        code: error.code
      });
      customToast.error(error.message || 'Something went wrong with payment initiation');
      setIsRetryingPayment(false);
    }
  };
  
  // Check if retry payment button should be shown
  const showRetryPayment = order && 
    !order.isPaid && 
    order.paymentMethod === 'Razorpay' && 
    order.orderStatus !== 'Cancelled';

  const handleDownloadInvoice = () => {
    dispatch(generateInvoice(id))
      .unwrap()
      .then(() => {
        customToast.success('Invoice downloaded successfully');
      })
      .catch((error) => {
        customToast.error(error || 'Failed to download invoice');
      });
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-yellow-100 text-yellow-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Returned':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getReturnStatusBadgeClass = (status) => {
    switch (status) {
      case 'Requested':
        return 'bg-yellow-100 text-yellow-800';
      case 'Accepted':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{message || 'Error fetching order details'}</p>
          </div>
          <Link 
            to="/orders"
            className="bg-black text-white py-2 px-6 rounded-md hover:bg-gray-800 inline-flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Back to Orders
          </Link>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link 
              to="/orders"
              className="bg-black text-white py-2 px-6 rounded-md hover:bg-gray-800 inline-flex items-center"
            >
              <FaArrowLeft className="mr-2" /> Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const canCancelOrder = order.orderStatus === 'Pending' || order.orderStatus === 'Processing';
  const canReturnItem = order.orderStatus === 'Delivered';
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <Link 
            to="/orders"
            className="bg-black text-white py-2 px-6 rounded-md hover:bg-gray-800 inline-flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Back to Orders
          </Link>
          
          <button 
            onClick={handleDownloadInvoice}
            className="bg-gray-200 text-gray-800 py-2 px-6 rounded-md hover:bg-gray-300 inline-flex items-center"
          >
            <FaFileInvoice className="mr-2" /> Download Invoice
          </button>
        </div>
        
        {/* Order Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="text-lg font-semibold">{order.orderId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="text-lg">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.orderStatus)}`}>
                {order.orderStatus}
              </span>
            </div>
            <div>
              {canCancelOrder && (
                <button
                  onClick={handleCancelFullOrder}
                  className="mt-2 text-red-600 hover:text-red-800 inline-flex items-center"
                >
                  <FaTimesCircle className="mr-1" /> Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
        
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Order Timeline</h2>
            <div className="space-y-4">
              {order.statusHistory.map((status, index) => (
                <div key={index} className="flex">
                  <div className="mr-4 relative">
                    <div className="w-4 h-4 rounded-full bg-blue-500 mt-1"></div>
                    {index < order.statusHistory.length - 1 && (
                      <div className="absolute top-5 bottom-0 left-2 w-0.5 -ml-px bg-blue-300"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{status.status}</p>
                    <p className="text-sm text-gray-500">{formatDate(status.date)}</p>
                    {status.note && <p className="text-sm text-gray-600 mt-1">{status.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
          <div className="flex items-start">
            <FaMapMarkerAlt className="text-gray-500 mt-1 mr-2" />
            <div>
              <p className="font-medium">{order.shippingAddress.name}</p>
              <p className="text-gray-600">{order.shippingAddress.address}</p>
              <p className="text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p className="text-gray-600">{order.shippingAddress.country}</p>
              <div className="mt-2 flex items-center">
                <FaPhone className="text-gray-500 mr-2" />
                <p className="text-gray-600">{order.shippingAddress.phone}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="font-medium">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Status</p>
              <div className="flex items-center">
                <p className="font-medium mr-4">
                  {order.isPaid ? `Paid on ${formatDate(order.paidAt)}` : 'Not Paid'}
                </p>
                {showRetryPayment && (
                  <button
                    onClick={handleRetryPayment}
                    disabled={isRetryingPayment}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm flex items-center"
                  >
                    {isRetryingPayment ? 'Processing...' : 'Retry Payment'}
                  </button>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Delivery Status</p>
              <p className="font-medium">
                {order.isDelivered ? `Delivered on ${formatDate(order.deliveredAt)}` : 'Not Delivered'}
              </p>
            </div>
          </div>
        </div>
        

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.orderItems.map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img className="h-10 w-10 rounded-full" src={`http://localhost:5001${item.product?.images[0]}` || '/placeholder.png'} alt="product" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.product?.name || 'Product'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.size}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.offerDiscount > 0 ? (
                        <div>
                          <div className="text-sm text-green-600">₹{item.discountedPrice.toFixed(2)}</div>
                          <div className="text-xs text-gray-500 line-through">₹{item.price.toFixed(2)}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-900">₹{item.price.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.returnReason ? (
                        <div>
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getReturnStatusBadgeClass(item.returnStatus)}`}>
                            Return {item.returnStatus}
                          </span>
                          {item.returnStatus === 'Accepted' && (
                            <div className="mt-1 text-xs text-green-600 font-medium">
                              <span className="block">Refund processed</span>
                              <span className="block">₹{(item.price * item.quantity).toFixed(2)} added to wallet</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(item.status || order.orderStatus)}`}>
                          {item.status || order.orderStatus}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {item.offerDiscount > 0 ? (
                        <div>
                          <div className="font-medium text-green-600">₹{(item.discountedPrice * item.quantity).toFixed(2)}</div>
                          <div className="text-xs text-gray-500 line-through">₹{(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                      ) : (
                        <div>₹{(item.price * item.quantity).toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {canCancelOrder && item.status !== 'Cancelled' && !item.returnReason && (
                        <button
                          onClick={() => openCancelItemModal(item._id)}
                          className="text-red-600 hover:text-red-900 mr-2"
                        >
                          <FaTimesCircle className="inline mr-1" /> Cancel
                        </button>
                      )}
                      {canReturnItem && item.status !== 'Cancelled' && !item.returnReason && (
                        <button
                          onClick={() => openReturnModal(item._id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FaUndo className="inline mr-1" /> Return
                        </button>
                      )}
                      {item.returnReason && (
                        <span className="text-sm text-gray-500">Return requested</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="w-full md:w-1/2 ml-auto">
            <div className="flex justify-between py-2">
              <p className="text-gray-600">Subtotal</p>
              <p className="font-medium">₹{order.itemsPrice.toFixed(2)}</p>
            </div>
            <div className="flex justify-between py-2">
              <p className="text-gray-600">Tax</p>
              <p className="font-medium">₹{order.taxPrice.toFixed(2)}</p>
            </div>
            <div className="flex justify-between py-2">
              <p className="text-gray-600">Shipping</p>
              <p className="font-medium">₹{order.shippingPrice.toFixed(2)}</p>
            </div>
            
            {order.discountPrice > 0 && (
              <div className="flex justify-between py-2">
                <p className="text-gray-600">Discount</p>
                <p className="font-medium text-green-600">-₹{order.discountPrice.toFixed(2)}</p>
              </div>
            )}
            <div className="flex justify-between py-3 border-t border-gray-200 mt-2">
              <p className="text-lg font-bold">Total</p>
              <p className="text-lg font-bold">₹{order.totalPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      
      <CancellationModal 
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelConfirm}
      />
      

      <ReturnRequestForm 
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        onConfirm={handleReturnConfirm}
      />
    </div>
  );
};

export default OrderDetails;
