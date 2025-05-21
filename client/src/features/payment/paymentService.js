import API from '../../utils/axiosConfig';

const API_URL = '/api/payments';

const getRazorpayKey = async() =>{
    const response = await API.get(`${API_URL}/razorpay-key`);
    return response.data;
}

const createOrder = async(orderData) =>{
    const response = await API.post(`${API_URL}/create-order`, orderData);
    return response.data;
}

const verifyPayment = async(paymentData) =>{
    const response = await API.post(`${API_URL}/verify-payment`,paymentData);
    return response.data;
}

const paymentService = {
    getRazorpayKey,
    createOrder,
    verifyPayment
}


export default paymentService;