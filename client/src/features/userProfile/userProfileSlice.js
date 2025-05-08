import {createSlice,createAsyncThunk} from "@reduxjs/toolkit";
import userProfileService from "./userService";


const initialState ={
    user:null,
    addresses:[],
    loading:false,
    success:false,
    error:null,
    message:'',
    otpSent:false,
};

//get user profile

export const getUserProfile = createAsyncThunk("userProfile/getUserProfile",async(_,thunkAPI)=>{
    try {
        const token = thunkAPI.getState().userAuth.userInfo.token;

        return await userProfileService.getUserProfile(token);
        
    } catch (error) {
        const message =
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message;
        return thunkAPI.rejectWithValue(message);
    }
})


//update user profile

export const updateUserProfile = createAsyncThunk("useProfile/updateUserProfile",async(userData,thunkAPI)=>{
    try{
        const token = thunkAPI.getState().userAuth.userInfo.token;

        return await userProfileService.updateProfile(userData,token);
        
    } catch (error) {
        const message =
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message;
        return thunkAPI.rejectWithValue(message);
    }
})

//change Email

export const changeEmail = createAsyncThunk("userProfile/changeEmail",async(emailData,thunkAPI)=>{
    try{
        const token = thunkAPI.getState().userAuth.userInfo.token;

        return await userProfileService.changeEmail(emailData,token);

    } catch (error) {
        const message =
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message;
        return thunkAPI.rejectWithValue(message);
    }
})

// Verify email change
export const verifyEmailChange = createAsyncThunk(
  "userProfile/verifyEmailChange",
  async (otpData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().userAuth.userInfo.token;
      return await userProfileService.verifyEmailChange(otpData, token);
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Change password
export const changePassword = createAsyncThunk(
  "userProfile/changePassword",
  async (passwordData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().userAuth.userInfo.token;
      return await userProfileService.changePassword(passwordData, token);
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get addresses
export const getAddresses = createAsyncThunk(
  "userProfile/getAddresses",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().userAuth.userInfo.token;
      return await userProfileService.getAddresses(token);
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add address
export const addAddress = createAsyncThunk(
  "userProfile/addAddress",
  async (addressData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().userAuth.userInfo.token;
      return await userProfileService.addAddress(addressData, token);
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update address
export const updateAddress = createAsyncThunk(
  "userProfile/updateAddress",
  async ({ addressId, addressData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().userAuth.userInfo.token;
      return await userProfileService.updateAddress(addressId, addressData, token);
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete address
export const deleteAddress = createAsyncThunk(
  "userProfile/deleteAddress",
  async (addressId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().userAuth.userInfo.token;
      return await userProfileService.deleteAddress(addressId, token);
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Set default address
export const setDefaultAddress = createAsyncThunk(
  "userProfile/setDefaultAddress",
  async (addressId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().userAuth.userInfo.token;
      return await userProfileService.setDefaultAddress(addressId, token);
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);


const userProfileSlice = createSlice({
    name:"userProfile",
    initialState,
    reducers:{
        resetUserProfile:(state)=>{
            state.loading = false;
            state.success = false;
            state.error = null;
            state.message="";
            state.otpSent = false;
        }
    },

    extraReducers:(builder) =>{
        builder
          .addCase(getUserProfile.pending, (state) => {
            state.loading = true;
          })
          .addCase(getUserProfile.fulfilled, (state,action) => {
            state.loading = false;
            state.user = action.payload;
          })
          .addCase(getUserProfile.rejected, (state,action) => {
            state.loading = false;
            state.error = action.payload;
          })
          //update user profile
          .addCase(updateUserProfile.pending, (state) => {
            state.loading = true;
          })
          .addCase(updateUserProfile.fulfilled, (state,action) => {
            state.loading = false;
            state.success = true;
            state.user = action.payload;
          })
          .addCase(updateUserProfile.rejected, (state,action) => {
            state.loading = false;
            state.error = action.payload;
          })
          // Change email
          .addCase(changeEmail.pending, (state) => {
            state.loading = true;
          })
          .addCase(changeEmail.fulfilled, (state, action) => {
            state.loading = false;
            state.otpSent = true;
            state.message = action.payload.message;
          })
          .addCase(changeEmail.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          })
          // Verify email change
          .addCase(verifyEmailChange.pending, (state) => {
            state.loading = true;
          })
          .addCase(verifyEmailChange.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.otpSent = false;
            state.message = action.payload.message;
          })
          .addCase(verifyEmailChange.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          })
          // Change password
          .addCase(changePassword.pending, (state) => {
            state.loading = true;
          })
          .addCase(changePassword.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.message = action.payload.message;
          })
          .addCase(changePassword.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          })
          // Get addresses
          .addCase(getAddresses.pending, (state) => {
            state.loading = true;
          })
          .addCase(getAddresses.fulfilled, (state, action) => {
            state.loading = false;
            state.addresses = action.payload;
          })
          .addCase(getAddresses.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          })
          // Add address
          .addCase(addAddress.pending, (state) => {
            state.loading = true;
          })
          .addCase(addAddress.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.message = action.payload.message;
            if (state.user && state.user.addresses) {
              state.user.addresses.push(action.payload.address);
            }
          })
          .addCase(addAddress.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          })
          //update address
          .addCase(updateAddress.pending , (state) =>{
            state.loading = true;
          })
          .addCase(updateAddress.fulfilled, (state,action)=>{
            state.loading = false;
            state.success  = true;
            state.message = action.payload.message;
            if(state.user && state.user.addresses){
              const index = state.user.addresses.findIndex((addr)=> addr._id ===action.payload.address._id);
              if(index !== -1){
                state.user.addresses[index] = action.payload.address;
              }
            }

          })
          .addCase(updateAddress.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          })
          //delete address
          .addCase(deleteAddress.pending, (state) => {
            state.loading = true;
          })
          .addCase(deleteAddress.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.message = action.payload.message;
            if (state.user && state.user.addresses && action.payload.addressId) {
              state.user.addresses = state.user.addresses.filter(
                (addr) => addr._id !== action.payload.addressId
              );
            }
          })
          .addCase(deleteAddress.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          })
          .addCase(setDefaultAddress.pending, (state) => {
            state.loading = true;
          })
          .addCase(setDefaultAddress.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.message = action.payload.message;
            if (state.user && state.user.addresses) {
              state.user.addresses = state.user.addresses.map((addr) => {
                if (addr._id === action.payload.address.id) {
                  addr.isDefault = true;
                } else {
                  addr.isDefault = false;
                }
                return addr;
              });
            }
          })
          .addCase(setDefaultAddress.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          })
          
          

            
    }
    
})
export const setUser = (state, action) => {
    state.user = action.payload;
    state.loading = false;
    state.success = true;
    state.error = null;
};

export const {resetUserProfile} = userProfileSlice.actions;
export default userProfileSlice.reducer;
