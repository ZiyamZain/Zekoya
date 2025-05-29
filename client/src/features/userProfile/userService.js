import axios from "axios";


const API_URL = "http://localhost:5001/api/users/profile";


//get user profile 

const getUserProfile = async(token) =>{
    const config ={
        headers:{
            Authorization:`Bearer ${token}`
        }
    }

    
    try {
        const response = await axios.get(API_URL, config);
        return response.data;
    } catch (error) {
        console.error('Error in getUserProfile service:', error.response?.data || error.message);
        throw error;
    }
}

//update user profile

const updateProfile = async(userData,token) =>{
    const config = {
        headers:{
            Authorization:`Bearer ${token}`,
        }
    }
    const response = await axios.put(API_URL, userData, config);
    return response.data;
}

//change email

const changeEmail = async(emailData,token)=>{
    const config ={
        headers:{
            Authorization:`Bearer ${token}`
        }
    }
    const response = await axios.post(`${API_URL}/change-email`,emailData,config)
    return response.data
}

//verify email change

const verifyEmailChange = async(otpData,token)=>{
    const config = {
        headers:{
            Authorization:`Bearer ${token}`
        }
    }
    const response = await axios.post(`${API_URL}/verify-email-change`,otpData,config)
    return response.data
}

// Request OTP for password change
const requestPasswordChangeOtp = async(passwordData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
    const response = await axios.post(`${API_URL}/request-password-change-otp`, passwordData, config)
    return response.data
}

// Verify OTP for password change
const verifyPasswordChangeOtp = async(otpData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
    const response = await axios.post(`${API_URL}/verify-password-change-otp`, otpData, config)
    return response.data
}

//change password

const changePassword = async(passwordData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
    const response = await axios.post(`${API_URL}/change-password`, passwordData, config)
    return response.data
}

//get addresses

const getAddresses = async(token)=>{
    const config = {
        headers:{
            Authorization:`Bearer ${token}`
        }
    }
    const response = await axios.get(`${API_URL}/addresses`,config)
    return response.data
}

//add address

const addAddress = async(addressData,token)=>{
    const config = {
        headers:{
            Authorization:`Bearer ${token}`
        }
    }
    const response = await axios.post(`${API_URL}/addresses`,addressData,config)
    return response.data
}

// Update address
const updateAddress = async (addressId, addressData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(`${API_URL}/addresses/${addressId}`, addressData, config);
  return response.data;
};

// Delete address
const deleteAddress = async (addressId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(`${API_URL}/addresses/${addressId}`, config);
  return response.data;
};

// Set default address
const setDefaultAddress = async (addressId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(`${API_URL}/addresses/${addressId}/default`, {}, config);
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