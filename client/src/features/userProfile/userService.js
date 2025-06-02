import { userAxios } from '../../utils/userAxiosConfig';

// Base URL is already set in userAxios, so we just need the path


//get user profile 

const getUserProfile = async() =>{
    try {
        // userAxios will automatically add auth header
        const response = await userAxios.get('/profile');
        return response.data;
    } catch (error) {
        console.error('Error in getUserProfile service:', error.response?.data || error.message);
        throw error;
    }
}

//update user profile

const updateProfile = async(userData) =>{
    // userAxios will automatically add auth header
    const response = await userAxios.put('/profile', userData);
    return response.data;
}

//change email

const changeEmail = async(emailData)=>{
    // userAxios will automatically add auth header
    const response = await userAxios.post('/profile/change-email', emailData)
    return response.data
}

//verify email change

const verifyEmailChange = async(otpData)=>{
    // userAxios will automatically add auth header
    const response = await userAxios.post('/profile/verify-email-change', otpData)
    return response.data
}

// Request OTP for password change
const requestPasswordChangeOtp = async(passwordData) => {
    // userAxios will automatically add auth header
    const response = await userAxios.post('/profile/request-password-change-otp', passwordData)
    return response.data
}

// Verify OTP for password change
const verifyPasswordChangeOtp = async(otpData) => {
    // userAxios will automatically add auth header
    const response = await userAxios.post('/profile/verify-password-change-otp', otpData)
    return response.data
}

//change password

const changePassword = async(passwordData) => {
    // userAxios will automatically add auth header
    const response = await userAxios.post('/profile/change-password', passwordData)
    return response.data
}

//get addresses

const getAddresses = async()=>{
    // userAxios will automatically add auth header
    const response = await userAxios.get('/profile/addresses')
    return response.data
}

//add address

const addAddress = async(addressData)=>{
    // userAxios will automatically add auth header
    const response = await userAxios.post('/profile/addresses', addressData)
    return response.data
}

// Update address
const updateAddress = async (addressId, addressData) => {
  // userAxios will automatically add auth header
  const response = await userAxios.put(`/profile/addresses/${addressId}`, addressData);
  return response.data;
};

// Delete address
const deleteAddress = async (addressId) => {
  // userAxios will automatically add auth header
  const response = await userAxios.delete(`/profile/addresses/${addressId}`);
  return response.data;
};

// Set default address
const setDefaultAddress = async (addressId) => {
  // userAxios will automatically add auth header
  const response = await userAxios.put(`/profile/addresses/${addressId}/default`, {});
  return response.data;
};

const userProfileService = {
  getUserProfile,
  updateProfile,
  changeEmail,
  verifyEmailChange,
  requestPasswordChangeOtp,
  verifyPasswordChangeOtp,
  changePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};

export default userProfileService;