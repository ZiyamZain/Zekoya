import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createPaymentOrder, getRazorpayKey, verifyPayment, reset } from '../../features/payment/paymentSlice';
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../../features/cart/cartSlice';

const RazorpayPayment = ({ orderData, orderId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { userInfo } = useSelector((state) => state.userAuth);
  const { razorpayKey, razorpayOrder, isLoading, isError, message } = useSelector(
    (state) => state.payment
  );

  const loadRazorpayScript = useCallback(() => {
    return new Promise((resolve) => {
      // Check if script already exists
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {

        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }, []);


  const initializePayment = useCallback(async () => {
    try {

      // First get the Razorpay key
      const keyResult = await dispatch(getRazorpayKey()).unwrap();

      
      // Then create a payment order
      const paymentOrderData = {
        amount: orderData.totalPrice,
        currency: 'INR',
        receipt: `order_rcpt_${orderId.substring(0, 8)}`,
        notes: {
          orderId: orderId,
          userId: userInfo?._id
        }
      };
      

      const orderResult = await dispatch(createPaymentOrder(paymentOrderData)).unwrap();

      if (orderResult && orderResult.order) {
        setTimeout(() => {
          handlePayment(keyResult.key_id, orderResult.order);
        }, 500);
      }
    } catch (error) {
      console.error('Error initializing payment:', error);
      toast.error('Failed to initialize payment. Please try again.');
    }
  }, [dispatch, orderData, orderId, userInfo, handlePayment]);


  const handlePayment = useCallback(async (key, order) => {
    const scriptLoaded = await loadRazorpayScript();
    
    if (!scriptLoaded) {
      toast.error('Razorpay SDK failed to load. Please try again later.');
      return;
    }
    
    // Use provided key and order, or fall back to state if not provided
    const paymentKey = key || razorpayKey;
    const paymentOrder = order || razorpayOrder;
    
    if (!paymentKey || !paymentOrder) {
      toast.error('Unable to initialize payment. Please try again.');
      return;
    }
    
    
    const options = {
      key: paymentKey,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      name: 'Zekoya',
      description: 'Payment for your order',
      order_id: paymentOrder.id,
      handler: async (response) => {
        try {
          const paymentData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId: orderId
          };
          
          await dispatch(verifyPayment(paymentData));
          
          dispatch(clearCart());
          navigate(`/order-success/${orderId}`);
        } catch (error) {
          console.error('Payment verification failed:', error);
          navigate(`/payment-failed/${orderId}`);
        }
      },
      prefill: {
        name: userInfo?.name || '',
        email: userInfo?.email || '',
        contact: userInfo?.phone || ''
      },
      theme: {
        color: '#3399cc'
      },
      modal: {
        ondismiss: function() {
          navigate(`/payment-failed/${orderId}`);
        }
      }
    };
    
    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error opening Razorpay:', error);
      toast.error('Failed to open payment gateway. Please try again.');
      navigate(`/payment-failed/${orderId}`);
    }
  }, [razorpayKey, razorpayOrder, orderId, userInfo, dispatch, navigate, loadRazorpayScript]);

  useEffect(() => {
    initializePayment();
    
    return () => {
      dispatch(reset());
    };
  }, [initializePayment, dispatch]);

  useEffect(() => {
    if (isError) {
      toast.error(message || 'Payment initialization failed');
      dispatch(reset());
    }
  }, [isError, message, dispatch]);
  


  return (
    <div className="text-center">
      {isLoading ? (
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Initializing payment gateway...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4 w-full max-w-md">
            <h3 className="font-medium text-green-800 mb-2">Order Created Successfully</h3>
            <p className="text-sm text-gray-600 mb-2">Your order has been created. Please complete the payment to confirm your order.</p>
            <p className="text-sm text-gray-600">Order Total: ₹{orderData.totalPrice}</p>
          </div>
          
          <button
            onClick={() => handlePayment()}
            disabled={isLoading}
            className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed w-full max-w-md flex items-center justify-center space-x-2"
          >
            <span>Pay Now</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default RazorpayPayment;
