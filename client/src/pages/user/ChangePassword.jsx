import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  sendPasswordChangeOtp,
  verifyPasswordChangeOtp,
  changePassword,
  resetUserProfile
} from "../../features/userProfile/userProfileSlice";

const ChangePassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.userAuth);
  const { loading, error, success } = useSelector(
    (state) => state.userProfile
  );

  const isGoogleUser = userInfo && userInfo.isGoogle;
  

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  

  const [step, setStep] = useState('request'); 
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // Clear any previous errors when component mounts
  useEffect(() => {
    dispatch(resetUserProfile());
  }, [dispatch]);

  // Clear error state when user changes input
  const clearErrors = () => {
    if (error) {
      dispatch(resetUserProfile());
    }
  };

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    if (success) {
      dispatch(resetUserProfile());
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    }
  }, [success, dispatch, navigate]);
  
  // Handle OTP timer
  useEffect(() => {
    if (step === 'verify' && otpSent) {
      setOtpTimer(60);
      setCanResend(false);
      const interval = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, otpSent]);
  
  // Move to next step when OTP is sent or verified
  useEffect(() => {
    if (otpSent && step === 'request') {
      setStep('verify');
    }
    if (otpVerified && step === 'verify') {
      setStep('reset');
    }
  }, [otpSent, otpVerified, step]);


  const handleRequestOtp = (values) => {
    dispatch(resetUserProfile()); // Reset any previous errors
    dispatch(sendPasswordChangeOtp({ currentPassword: values.currentPassword }))
      .unwrap()
      .then(() => {
        setOtpSent(true);
      })
      .catch((err) => {
        // Error is already set in the state by the rejected action
        console.error("Failed to send OTP:", err);
      });
  };


  const handleVerifyOtp = (values) => {
    dispatch(resetUserProfile()); // Reset any previous errors
    dispatch(verifyPasswordChangeOtp({ otp: values.otp }))
      .unwrap()
      .then(() => {
        setOtpVerified(true);
      })
      .catch((err) => {
        console.error("Failed to verify OTP:", err);
      });
  };


  const handleResendOtp = () => {
    if (!canResend) return;
    setOtpTimer(60);
    setCanResend(false);
  };

  // Change Password handler
  const handleChangePassword = (values) => {
    dispatch(resetUserProfile()); // Reset any previous errors
    dispatch(changePassword({
      currentPassword: localStorage.getItem('tempCurrentPassword') || '',
      newPassword: values.newPassword
    }));
    // Clean up temporary storage
    localStorage.removeItem('tempCurrentPassword');
  };

  // Reset flow handler
  const handleResetFlow = () => {
    setStep('request');
    setOtpSent(false);
    setOtpVerified(false);
    localStorage.removeItem('tempCurrentPassword');
    dispatch(resetUserProfile()); // Reset any errors when going back
  };

  if (success) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-xl overflow-hidden p-8 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Password Changed Successfully
          </h2>
          <p className="text-gray-600 mb-6">
            Your password has been updated. You'll be redirected to your profile
            page shortly.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-green-500 h-2 rounded-full animate-pulse"></div>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Redirecting to profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Hero section */}
      <div className="bg-black text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-2">Change Password</h1>
          <p className="text-gray-300">Update your account password</p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {isGoogleUser ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="h-10 w-10"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Google Account Linked
              </h2>
              <p className="text-gray-600 mb-6">
                Your password is managed by Google. To change your password,
                please visit your Google Account security settings.
              </p>
              <a
                href="https://myaccount.google.com/security"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors inline-flex items-center shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Go to Google Security Settings
              </a>
            </div>
          ) : (
            <div className="p-8">
              {/* Step 1: Request OTP */}
              {step === 'request' && (
                <Formik
                  initialValues={{ currentPassword: '' }}
                  validationSchema={Yup.object({
                    currentPassword: Yup.string().required('Current password is required')
                  })}
                  onSubmit={(values, { setSubmitting }) => {
                    handleRequestOtp(values);
                    setSubmitting(false);
                  }}
                >
                  {({ isSubmitting }) => (
                    <Form className="space-y-6">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="currentPassword">
                          Current Password
                        </label>
                        <div className="relative">
                          <Field
                            type={showCurrentPassword ? "text" : "password"}
                            id="currentPassword"
                            name="currentPassword"
                            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                          <button
                            type="button"
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                        <ErrorMessage name="currentPassword" component="div" className="text-red-600 text-sm mt-1" />
                      </div>
                      
                      <p className="text-gray-600 text-sm">
                        We'll send a verification code to your email to confirm it's you.
                      </p>
                      
                      <button
                        type="submit"
                        className="w-full bg-black text-white py-3 rounded-md font-medium hover:bg-gray-900 transition-colors duration-300"
                        disabled={loading || isSubmitting}
                        onClick={clearErrors}
                      >
                        {loading ? "Sending Verification Code..." : "Send Verification Code"}
                      </button>
                    </Form>
                  )}
                </Formik>
              )}
              
              {/* Step 2: Verify OTP */}
              {step === 'verify' && (
                <Formik
                  initialValues={{ otp: '' }}
                  validationSchema={Yup.object({
                    otp: Yup.string().length(6, 'OTP must be 6 digits').required('OTP is required')
                  })}
                  onSubmit={(values, { setSubmitting }) => {
                    handleVerifyOtp(values);
                    setSubmitting(false);
                  }}
                >
                  {({ isSubmitting }) => (
                    <Form className="space-y-6">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Identity</h2>
                        <p className="text-gray-600">
                          Enter the 6-digit code sent to your email
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-center mb-2">
                        <span className="text-xs text-gray-700 font-semibold">
                          Code expires in: {Math.floor(otpTimer / 60)}:{otpTimer % 60 < 10 ? "0" + (otpTimer % 60) : otpTimer % 60}s
                        </span>
                        {otpTimer === 0 && (
                          <span className="text-xs text-red-600 font-semibold mt-1">
                            Code expired. Please request a new one.
                          </span>
                        )}
                      </div>
                      
                      <div>
                        <Field
                          type="text"
                          name="otp"
                          placeholder="Enter 6-digit code"
                          maxLength="6"
                          className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-center text-2xl tracking-widest"
                          disabled={otpTimer === 0}
                        />
                        <ErrorMessage name="otp" component="div" className="text-red-600 text-sm mt-1" />
                      </div>
                      
                      <div className="flex flex-col space-y-3">
                        <button
                          type="submit"
                          className="w-full bg-black text-white py-3 rounded-md font-medium hover:bg-gray-900 transition-colors duration-300"
                          disabled={loading || isSubmitting || otpTimer === 0}
                        >
                          {loading ? "Verifying..." : "Verify Code"}
                        </button>
                        
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={!canResend || loading}
                          className="w-full bg-gray-200 text-black py-2 rounded-md hover:bg-gray-300 transition-colors duration-300 disabled:opacity-50"
                        >
                          {canResend ? "Resend Code" : `Resend Code in ${otpTimer}s`}
                        </button>
                        
                        <button
                          type="button"
                          onClick={handleResetFlow}
                          className="text-gray-600 text-sm hover:underline"
                        >
                          Back to previous step
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              )}
              
              {/* Step 3: Set New Password */}
              {step === 'reset' && (
                <Formik
                  initialValues={{ newPassword: '', confirmPassword: '' }}
                  validationSchema={Yup.object({
                    newPassword: Yup.string()
                      .min(6, "Password must be at least 6 characters")
                      .matches(
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/,
                        'Password must be at least 6 characters and include uppercase, lowercase, and a number'
                      )
                      .required("Password is required"),
                    confirmPassword: Yup.string()
                      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
                      .required('Confirm password is required')
                  })}
                  onSubmit={(values, { setSubmitting }) => {
                    handleChangePassword(values);
                    setSubmitting(false);
                  }}
                >
                  {({ isSubmitting }) => (
                    <Form className="space-y-6">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Set New Password</h2>
                        <p className="text-gray-600">
                          Create a strong password for your account
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="newPassword">
                          New Password
                        </label>
                        <div className="relative">
                          <Field
                            type={showNewPassword ? "text" : "password"}
                            id="newPassword"
                            name="newPassword"
                            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                          <button
                            type="button"
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                        <ErrorMessage name="newPassword" component="div" className="text-red-600 text-sm mt-1" />
                        <p className="text-gray-500 text-xs mt-1">
                          Password must be at least 6 characters and include uppercase, lowercase, and a number
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="confirmPassword">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Field
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            name="confirmPassword"
                            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                          <button
                            type="button"
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                        <ErrorMessage name="confirmPassword" component="div" className="text-red-600 text-sm mt-1" />
                      </div>
                      
                      <button
                        type="submit"
                        className="w-full bg-black text-white py-3 rounded-md font-medium hover:bg-gray-900 transition-colors duration-300"
                        disabled={loading || isSubmitting}
                      >
                        {loading ? "Updating Password..." : "Update Password"}
                      </button>
                    </Form>
                  )}
                </Formik>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
