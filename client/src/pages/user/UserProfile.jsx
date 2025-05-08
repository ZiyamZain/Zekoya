import React, { useEffect } from "react";

import { useSelector, useDispatch } from "react-redux";
import { getUserProfile, getAddresses, setDefaultAddress, deleteAddress, resetUserProfile } from "../../features/userProfile/userProfileSlice";
import { useNavigate, Link } from "react-router-dom";

const UserProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.userAuth);
  const { user, success, loading, error } = useSelector((state) => state.userProfile || {});
  
  // Check if user is authenticated via Google
  const isGoogleUser = userInfo && userInfo.isGoogle;

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    } else {
      dispatch(getUserProfile());
    }
  }, [dispatch, navigate, userInfo]);

  useEffect(() => {
    if (success) {
      dispatch(getUserProfile());
      dispatch(resetUserProfile());
    }
  }, [success, dispatch]);

  const handleSetDefault = (addressId) => {
    dispatch(setDefaultAddress(addressId));
  };

  const handleDeleteAddress = (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      dispatch(deleteAddress(addressId));
    }
  };

  // Watch for loading state changes after delete operation
  useEffect(() => {
    // This will run when loading changes from true to false after a delete operation
    if (!loading && success) {
      dispatch(resetUserProfile());
    }
  }, [loading, success, dispatch]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Hero section with user info */}
      <div className="bg-black text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-2">My Account</h1>
          <p className="text-gray-300">Manage your profile and preferences</p>
        </div>
      </div>

      {error && (
        <div className="container mx-auto px-4 mt-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {user && (
        <div className="container mx-auto px-4 -mt-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="md:flex">
              {/* Sidebar with user info */}
              <div className="md:w-1/3 bg-gray-50 p-8 flex flex-col items-center border-r border-gray-200">
                <div className="relative group">
                  <div className="w-36 h-36 rounded-full overflow-hidden mb-6 border-4 border-white shadow-md">
                    <img
                      src={user.profileImage || "/default-avatar.png"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                    <Link to="/profile/edit" className="text-white bg-black p-2 rounded-full hover:bg-gray-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </Link>
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-1 text-gray-800">{user.name}</h2>
                <p className="text-gray-600 mb-4">{user.email}</p>
                
                {/* Wallet Balance Card */}
                <div className="w-full bg-gradient-to-r from-gray-800 to-black rounded-lg p-4 mb-6 shadow-md">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-white font-medium">Wallet Balance</h3>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    ${user.walletBalance ? user.walletBalance.toFixed(2) : '0.00'}
                  </div>
                  <div className="text-xs text-gray-300">
                    Available for purchases and refunds
                  </div>
                  {user.walletHistory && user.walletHistory.length > 0 && (
                    <Link to="/wallet/history" className="text-xs text-blue-300 hover:text-blue-200 mt-2 inline-block">
                      View transaction history →
                    </Link>
                  )}
                </div>
                <div className="space-y-3 w-full">
                  <Link
                    to="/profile/edit"
                    className="flex items-center justify-center w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit Profile
                  </Link>
                  {!isGoogleUser && (
                    <>
                      <Link
                        to="/profile/change-password"
                        className="flex items-center justify-center w-full bg-white text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition border border-gray-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Change Password
                      </Link>
                      <Link
                        to="/profile/change-email"
                        className="flex items-center justify-center w-full bg-white text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition border border-gray-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        Change Email
                      </Link>
                    </>
                  )}
                  {isGoogleUser && (
                    <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                      <div className="flex justify-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-6 w-6">
                          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Your account is managed by Google</p>
                      <a 
                        href="https://myaccount.google.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Manage your Google Account
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Main content with addresses */}
              <div className="md:w-2/3 p-8">
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">My Addresses</h3>
                    <Link
                      to="/profile/addresses/add"
                      className="bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition flex items-center shadow-md"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add New Address
                    </Link>
                  </div>

                  {user && user.addresses && user.addresses.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {user.addresses.map((address) => (
                        <div
                          key={address._id}
                          className={`rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg ${
                            address.isDefault
                              ? "border-2 border-black bg-gray-50"
                              : "border border-gray-200 bg-white"
                          }`}
                        >
                          <div className="p-5">
                            {address.isDefault && (
                              <div className="bg-black text-white text-xs py-1 px-3 rounded-full inline-block mb-3">
                                Default
                              </div>
                            )}
                            <p className="font-bold text-lg text-gray-800">{address.name}</p>
                            <p className="text-gray-600">{address.phone}</p>
                            <p className="text-gray-600 mt-2">{address.addressLine1}</p>
                            {address.addressLine2 && (
                              <p className="text-gray-600">{address.addressLine2}</p>
                            )}
                            <p className="text-gray-600">
                              {address.city}, {address.state}, {address.postalCode}
                            </p>
                            <p className="text-gray-600">{address.country}</p>

                            <div className="mt-4 flex space-x-4 border-t pt-4">
                              <Link
                                to={`/profile/addresses/edit/${address._id}`}
                                className="text-black hover:text-gray-800 font-medium flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                                Edit
                              </Link>
                              {!address.isDefault && (
                                <button
                                  className="text-green-600 hover:text-green-800 font-medium flex items-center"
                                  onClick={() => handleSetDefault(address._id)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Set as Default
                                </button>
                              )}
                              <button
                                className="text-red-600 hover:text-red-800 font-medium flex items-center"
                                onClick={() => handleDeleteAddress(address._id)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center shadow-md">
                      <div className="mb-4 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 mb-6">
                        You haven't added any addresses yet
                      </p>
                      <Link
                        to="/profile/addresses/add"
                        className="bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition inline-flex items-center shadow-md"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Your First Address
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;