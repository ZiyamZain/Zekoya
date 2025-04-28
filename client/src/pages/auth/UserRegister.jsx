import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  userRegister,
  verifyOTP,
  resetOTP,
  googleLogin,
} from "../../features/userAuth/userAuthSlice.js";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const UserRegister = () => {
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [lastRegisterValues, setLastRegisterValues] = useState(null); // for resend
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, userId, otpSent, loading, error } = useSelector(
    (state) => state.userAuth
  );

  // State to store OTP if present in userId (for UI display)
  const [devOtp, setDevOtp] = useState("");

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      try {
        if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
          console.error("Google Client ID is not configured");
          return;
        }
        if (window.google && window.google.accounts && window.google.accounts.id) {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleGoogleSignIn,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          window.google.accounts.id.renderButton(
            document.getElementById("googleSignInButton"),
            {
              theme: "outline",
              size: "large",
              width: 300,
              text: "signup_with",
              shape: "rectangular",
            }
          );
        }
      } catch (error) {
        console.error("Error initializing Google Sign-In:", error);
      }
    };
    if (window.google && window.google.accounts && window.google.accounts.id) {
      initializeGoogleSignIn();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      script.onerror = (error) => {
        console.error("Failed to load Google Sign-In script:", error);
      };
      document.body.appendChild(script);
    }
    return () => {
      const script = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (script) {
        script.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (otpSent) {
      setOtpTimer(60);
      setCanResend(false);
      const interval = setInterval(() => {
        setOtpTimer((prev) => {
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
  }, [otpSent]);

  // Listen for OTP in userId (if backend returns it)
  useEffect(() => {
    // If userId is an object with .otp, or if Redux state has another property for OTP, update devOtp
    if (userId && typeof userId === 'object' && userId.otp) {
      setDevOtp(userId.otp);
    }
    // If the backend returns OTP in another way, add logic here
  }, [userId]);

  const handleGoogleSignIn = async (response) => {
    try {
      // Use googleLogin instead of googleSignIn, send the credential as { token }
      dispatch(googleLogin({ token: response.credential }));
    } catch (error) {
      console.error("Error handling Google sign-in:", error);
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate("/home");
    }
  }, [userInfo, navigate]);

  // Formik/Yup validation schemas
  const registerSchema = Yup.object({
    name: Yup.string()
      .min(3, 'Name must be at least 3 characters')
      .matches(/^\S.*\S$|^\S{3,}$/,
        'Name cannot start or end with spaces')
      .required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .matches(/^\S*$/, 'Password must not contain spaces')
      .required('Password is required'),
  });

  const otpSchema = Yup.object({
    otp: Yup.string().length(6, 'OTP must be 6 digits').required('OTP is required'),
  });

  // Resend OTP handler
  const handleResendOtp = (formValues) => {
    if (!canResend) return;
    dispatch(userRegister({
      name: formValues.name,
      email: formValues.email,
      password: formValues.password,
    }));
    setOtpTimer(60);
    setCanResend(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-black tracking-tighter mb-2 font-['Bebas_Neue']">
            ZEKOYA
          </h1>
          <div className="w-16 h-1 bg-black mx-auto"></div>
          <p className="mt-4 text-gray-600 uppercase tracking-wide text-sm font-medium">
            {otpSent ? "Verify your email" : "Create your account"}
          </p>
        </div>
        <div className="space-y-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          {/* DEV: Show OTP if present for testing (remove in production) */}
          {otpSent && devOtp && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mb-2">
              <span className="text-yellow-800 font-mono">DEV OTP: {devOtp}</span>
            </div>
          )}
          {!otpSent ? (
            <Formik
              initialValues={{ name: '', email: '', password: '', otp: '' }}
              validationSchema={registerSchema}
              onSubmit={(values) => {
                setLastRegisterValues(values); // for resend
                dispatch(userRegister({
                  name: values.name,
                  email: values.email,
                  password: values.password,
                }));
              }}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  <div className="space-y-4">
                    <Field
                      type="text"
                      name="name"
                      placeholder="USERNAME"
                      className="w-full px-4 py-4 bg-gray-100 border-2 border-transparent rounded-none text-black placeholder-gray-500 focus:border-black focus:bg-white transition-all duration-300 font-medium tracking-wide"
                    />
                    <ErrorMessage name="name" component="div" className="text-red-600 text-sm" />
                    <Field
                      type="email"
                      name="email"
                      placeholder="EMAIL"
                      className="w-full px-4 py-4 bg-gray-100 border-2 border-transparent rounded-none text-black placeholder-gray-500 focus:border-black focus:bg-white transition-all duration-300 font-medium tracking-wide"
                    />
                    <ErrorMessage name="email" component="div" className="text-red-600 text-sm" />
                    <Field
                      type="password"
                      name="password"
                      placeholder="PASSWORD"
                      className="w-full px-4 py-4 bg-gray-100 border-2 border-transparent rounded-none text-black placeholder-gray-500 focus:border-black focus:bg-white transition-all duration-300 font-medium tracking-wide"
                    />
                    <ErrorMessage name="password" component="div" className="text-red-600 text-sm" />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-black text-white py-4 font-bold tracking-wider hover:bg-gray-900 transition-colors duration-300 disabled:bg-gray-400"
                    disabled={loading || isSubmitting}
                  >
                    {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                  </button>
                </Form>
              )}
            </Formik>
          ) : (
            <Formik
              initialValues={{ otp: '' }}
              validationSchema={otpSchema}
              onSubmit={(values) => {
                dispatch(verifyOTP({ userId, otp: values.otp }));
              }}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  <div className="flex flex-col items-center mb-2">
                    <span className="text-xs text-gray-700 font-semibold">
                      OTP expires in: {Math.floor(otpTimer / 60)}:{otpTimer % 60 < 10 ? '0' + otpTimer % 60 : otpTimer % 60}s
                    </span>
                    {otpTimer === 0 && (
                      <span className="text-xs text-red-600 font-semibold mt-1">OTP expired. Please resend OTP.</span>
                    )}
                  </div>
                  <div className="space-y-4">
                    <Field
                      type="text"
                      name="otp"
                      placeholder="ENTER 6-DIGIT OTP"
                      className="w-full px-4 py-4 bg-gray-100 border-2 border-transparent rounded-none text-black placeholder-gray-500 focus:border-black focus:bg-white transition-all duration-300 font-medium tracking-wide text-center letter-spacing-wide"
                      maxLength="6"
                      disabled={otpTimer === 0}
                    />
                    <ErrorMessage name="otp" component="div" className="text-red-600 text-sm" />
                  </div>
                  <div className="flex flex-col gap-2 items-center">
                    <button
                      type="button"
                      onClick={() => handleResendOtp(lastRegisterValues)}
                      disabled={!canResend || loading}
                      className={`w-full py-2 px-4 border-2 border-black font-bold tracking-wider rounded transition-colors duration-300 ${canResend ? 'bg-black text-white hover:bg-white hover:text-black' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                    >
                      {canResend ? 'Resend OTP' : `Resend OTP in ${otpTimer}s`}
                    </button>
                  </div>
                  <div className="space-y-3">
                    <button
                      type="submit"
                      className="w-full bg-black text-white py-4 font-bold tracking-wider hover:bg-gray-900 transition-colors duration-300"
                      disabled={otpTimer === 0 || loading || isSubmitting}
                    >
                      {loading ? "VERIFYING..." : "VERIFY OTP"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { dispatch(resetOTP()); setDevOtp(""); }}
                      className="w-full bg-white text-black py-4 font-bold tracking-wider border-2 border-black hover:bg-black hover:text-white transition-colors duration-300"
                      disabled={loading}
                    >
                      GO BACK
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}
          {!otpSent && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 uppercase tracking-wide text-sm font-medium">
                    Or continue with
                  </span>
                </div>
              </div>
              <div id="googleSignInButton" className="flex justify-center"></div>
              <p className="text-center text-black">
                Already have an account?{' '}
                <a href="/login" className="font-bold hover:underline">
                  Sign in now
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
