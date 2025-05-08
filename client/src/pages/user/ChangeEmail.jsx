import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  changeEmail,
  verifyEmailChange,
  resetUserProfile,
} from "../../features/userProfile/userProfileSlice"
import { toast } from "react-toastify";
import Button from "../../components/user/Button";
import Loader from "../../components/user/Loader";

const ChangeEmail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.userAuth);
  const { loading, error, success, otpSent, message } = useSelector(
    (state) => state.userProfile
  );
  
  // Check if user is authenticated via Google
  const isGoogleUser = userInfo && userInfo.isGoogle;

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    }
    return () => dispatch(resetUserProfile());
  }, [userInfo, navigate, dispatch]);

  useEffect(() => {
    if (success) {
      toast.success(message);
      setTimeout(() => navigate("/profile"), 3000);
    }
    if (error) toast.error(error);
  }, [success, error, message, navigate]);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return toast.error("Please enter a valid email address");
    }
    dispatch(changeEmail({ newEmail: email }));
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      return toast.error("OTP must be 6 digits");
    }
    dispatch(verifyEmailChange({ otp }));
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Hero section */}
      <div className="bg-black text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-2">Change Email</h1>
          <p className="text-gray-300">Update your account email address</p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="p-8">
            {isGoogleUser ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-10 w-10">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Google Account Linked</h2>
                <p className="text-gray-600 mb-6">
                  Your email address is managed by Google. To change your email, please visit your Google Account settings.
                </p>
                <a 
                  href="https://myaccount.google.com/email" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors inline-flex items-center shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Go to Google Account Settings
                </a>
              </div>
            ) : !otpSent ? (
              <div>
                <div className="mb-8 text-center">
                  <div className="w-12 h-12 bg-gray-100 text-black rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Update Your Email</h2>
                  <p className="text-gray-600 mt-2">We'll send a verification code to your new email</p>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                      New Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black transition-colors"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center justify-center shadow-md"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                          </svg>
                          Send Verification Code
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <div className="mb-8 text-center">
                  <div className="w-12 h-12 bg-gray-100 text-black rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Verify Your Email</h2>
                  <p className="text-gray-600 mt-2">
                    We've sent a 6-digit code to <span className="font-medium">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="otp">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black transition-colors text-center tracking-widest font-mono text-lg"
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Enter the 6-digit code we sent to your email
                    </p>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center justify-center shadow-md"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Verify Code
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeEmail;
