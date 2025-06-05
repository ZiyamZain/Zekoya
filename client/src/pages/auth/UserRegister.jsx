import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  userRegister,
  verifyOTP,
  resendOTP,
  googleLogin,
} from "../../features/userAuth/userAuthSlice.js";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const UserRegister = () => {
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [lastRegisterValues, setLastRegisterValues] = useState(null); // for resend
  const [resendSuccess, setResendSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, userId, otpSent, loading, error } = useSelector(
    (state) => state.userAuth
  );

  // State to store OTP if present in userId (for UI display)
  const [devOtp, setDevOtp] = useState("");

  const handleGoogleSignIn = useCallback(async (response) => {
    try {
      dispatch(googleLogin({ token: response.credential }));
    } catch (error) {
      console.error("Error handling Google sign-in:", error);
    }
  }, [dispatch]);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      try {
        if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
          console.error("Google Client ID is not configured");
          return;
        }
        if (
          window.google &&
          window.google.accounts &&
          window.google.accounts.id
        ) {
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
  }, [handleGoogleSignIn]);

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
    if (userId && typeof userId === "object" && userId.otp) {
      setDevOtp(userId.otp);
    }
    // If the backend returns OTP in another way, add logic here
  }, [userId]);



  useEffect(() => {
    if (userInfo) {
      navigate("/home");
    }
  }, [userInfo, navigate]);

  // Formik/Yup validation schemas
  const registerSchema = Yup.object({
    name: Yup.string()
      .min(3, "Name must be at least 3 characters")
      .matches(/^\S.*\S$|^\S{3,}$/, "Name cannot start or end with spaces")
      .required("Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&#_.]{6,}$/,
        'Password must be at least 6 characters and include uppercase, lowercase, and a number'
      )
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
    referralCode: Yup.string()
      .trim()
      .matches(/^$|^ZK[A-Z0-9]{8}$/, 'Invalid referral code format')
  });

  const otpSchema = Yup.object({
    otp: Yup.string()
      .length(6, "OTP must be 6 digits")
      .required("OTP is required"),
  });

  const handleResendOtp = async () => {
    if (lastRegisterValues && lastRegisterValues.email) {
      setResendSuccess("");
      const resultAction = await dispatch(resendOTP(lastRegisterValues.email));
      if (resendOTP.fulfilled.match(resultAction)) {
        setOtpTimer(60); // Reset timer
        setCanResend(false); // Optionally disable resend for a bit
        setResendSuccess("OTP resent to your email.");
      } else if (resendOTP.rejected.match(resultAction)) {
        setResendSuccess("");
      }
    }
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
              <span className="text-yellow-800 font-mono">
                DEV OTP: {devOtp}
              </span>
            </div>
          )}
          {resendSuccess && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-2">
              <p className="text-green-700">{resendSuccess}</p>
            </div>
          )}
          {!otpSent ? (
            <Formik
              initialValues={{
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
                referralCode: "",
              }}
              validationSchema={registerSchema}
              onSubmit={async (values, { setFieldError }) => {
                setLastRegisterValues(values); // Store for potential resend
                setResendSuccess("");
                try {
                  await dispatch(userRegister(values)).unwrap();
                  // OTP sent, UI will switch, no need to setSubmitting(false) here
                } catch (err) {
                  if (err && err.message) {
                    setFieldError("email", err.message);
                  } else {
                    setFieldError(
                      "email",
                      "Registration failed. Please try again."
                    );
                  }
                  // No need to setSubmitting(false) here as Formik handles it on error
                }
              }}
            >
              {() => (
                <Form className="space-y-6">
                  <div>
                    <Field
                      type="text"
                      name="name"
                      placeholder="FULL NAME"
                      className="w-full px-4 py-4 bg-gray-100 border-2 border-transparent rounded-none text-black placeholder-gray-500 focus:border-black focus:bg-white transition-all duration-300 font-medium tracking-wide"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Field
                      type="email"
                      name="email"
                      placeholder="EMAIL ADDRESS"
                      className="w-full px-4 py-4 bg-gray-100 border-2 border-transparent rounded-none text-black placeholder-gray-500 focus:border-black focus:bg-white transition-all duration-300 font-medium tracking-wide"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>
                  <div className="relative">
                    <Field
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="PASSWORD"
                      className="w-full px-4 py-4 bg-gray-100 border-2 border-transparent rounded-none text-black placeholder-gray-500 focus:border-black focus:bg-white transition-all duration-300 font-medium tracking-wide"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-500 hover:text-black"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-600 text-sm -mt-3"
                  />
                  <div className="relative">
                    <Field
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="CONFIRM PASSWORD"
                      className="w-full px-4 py-4 bg-gray-100 border-2 border-transparent rounded-none text-black placeholder-gray-500 focus:border-black focus:bg-white transition-all duration-300 font-medium tracking-wide"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-500 hover:text-black"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="text-red-600 text-sm -mt-3"
                  />
                  <div>
                    <Field
                      type="text"
                      name="referralCode"
                      placeholder="REFERRAL CODE (OPTIONAL)"
                      className="w-full px-4 py-4 bg-gray-100 border-2 border-transparent rounded-none text-black placeholder-gray-500 focus:border-black focus:bg-white transition-all duration-300 font-medium tracking-wide"
                    />
                    <ErrorMessage
                      name="referralCode"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-black text-white py-4 font-bold tracking-wider hover:bg-gray-900 transition-colors duration-300"
                    disabled={loading}
                  >
                    {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                  </button>
                </Form>
              )}
            </Formik>
          ) : (
            <Formik
              initialValues={{ otp: "" }}
              validationSchema={otpSchema}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  await dispatch(verifyOTP({ userId, otp: values.otp }));
                } catch (err) {
                  console.error("OTP Form Submit Error:", err);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {() => (
                <Form className="space-y-6">
                  <div>
                    <Field
                      type="text"
                      name="otp"
                      placeholder="ENTER 6-DIGIT OTP"
                      maxLength="6"
                      className="w-full px-4 py-4 bg-gray-100 border-2 border-transparent rounded-none text-black placeholder-gray-500 focus:border-black focus:bg-white transition-all duration-300 font-medium tracking-wide text-center"
                    />
                    <ErrorMessage
                      name="otp"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-black text-white py-4 font-bold tracking-wider hover:bg-gray-900 transition-colors duration-300"
                    disabled={loading}
                  >
                    {loading ? "VERIFYING..." : "VERIFY & REGISTER"}
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={!canResend || loading}
                    className={`w-full py-2 px-4 border-2 border-black font-bold tracking-wider rounded transition-colors duration-300 ${
                      canResend
                        ? "bg-black text-white hover:bg-white hover:text-black"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {canResend ? "Resend OTP" : `Resend OTP in ${otpTimer}s`}
                  </button>
                </Form>
              )}
            </Formik>
          )}
          {/* End of conditional rendering for forms */}

          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative px-3 bg-white text-sm text-gray-500">
              OR
            </div>
          </div>

          <div id="googleSignInButton" className="flex justify-center"></div>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-black hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
