import { paymentAxios } from '../../utils/userAxiosConfig';

// Base URL is already set in userAxios, so we just need the path

const getRazorpayKey = async() =>{
    // paymentAxios will automatically add auth header
    const response = await paymentAxios.get('/razorpay-key');
    return response.data;
}

const createOrder = async(orderData) =>{
    // paymentAxios will automatically add auth header
    const response = await paymentAxios.post('/create-order', orderData);
    return response.data;
}

const verifyPayment = async(paymentData) =>{
    // paymentAxios will automatically add auth header
    const response = await paymentAxios.post('/verify-payment', paymentData);
    return response.data;
}

const paymentService = {
    getRazorpayKey,
    createOrder,
    verifyPayment
}


export default paymentService;