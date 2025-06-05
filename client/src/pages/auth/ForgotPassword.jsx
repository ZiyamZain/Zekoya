import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendForgotPasswordOtp, verifyForgotPasswordOtp, changePassword } from '../../features/userAuth/userAuthSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { forgotOtpSent, forgotUserId, loading, error } = useSelector(state => state.userAuth);
  const [step, setStep] = useState('request'); // 'request', 'verify', 'reset'
  const [email, setEmail] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);

  // Timer effect
  React.useEffect(() => {
    if (step === 'verify' && forgotOtpSent) {
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
  }, [step, forgotOtpSent]);

  // Show backend error messages in the UI for forgot password
  useEffect(() => {
    if (error) {
      alert(error); // Replace with toast or better UI in production
    }
  }, [error]);

  // Request OTP
  const handleRequestOtp = (values) => {
    setEmail(values.email);
    dispatch(sendForgotPasswordOtp({ email: values.email }))
      .then(() => {
        setStep('verify');
      });
  };

  // Verify OTP
  const handleVerifyOtp = (values) => {
    dispatch(verifyForgotPasswordOtp({ userId: forgotUserId, otp: values.otp }))
      .then(() => {
        setStep('reset');
      });
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (!canResend) return;
    dispatch(sendForgotPasswordOtp({ email }));
    setOtpTimer(60);
    setCanResend(false);
  };

  // Change Password
  const handleChangePassword = (values) => {
    dispatch(changePassword({ userId: forgotUserId, password: values.password }))
      .then(() => {
        navigate('/login');
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Forgot Password</h2>
        </div>
        {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4"><p className="text-red-700">{error}</p></div>}
        {step === 'request' && (
          <Formik
            initialValues={{ email: '' }}
            validationSchema={Yup.object({ email: Yup.string().email('Invalid email').required('Required') })}
            onSubmit={handleRequestOtp}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <Field name="email" type="email" placeholder="Enter your email" className="w-full px-4 py-3 border rounded" />
                <ErrorMessage name="email" component="div" className="text-red-600 text-sm" />
                <button type="submit" className="w-full bg-black text-white py-3 rounded" disabled={isSubmitting || loading}>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </Form>
            )}
          </Formik>
        )}
        {step === 'verify' && (
          <Formik
            initialValues={{ otp: '' }}
            validationSchema={Yup.object({ otp: Yup.string().length(6, 'OTP must be 6 digits').required('Required') })}
            onSubmit={handleVerifyOtp}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <Field name="otp" type="text" placeholder="Enter OTP" maxLength={6} className="w-full px-4 py-3 border rounded text-center" />
                <ErrorMessage name="otp" component="div" className="text-red-600 text-sm" />
                <button type="submit" className="w-full bg-black text-white py-3 rounded" disabled={isSubmitting || loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button type="button" onClick={handleResendOtp} disabled={!canResend || loading} className="w-full mt-2 bg-gray-200 text-black py-2 rounded">
                  {canResend ? 'Resend OTP' : `Resend OTP in ${otpTimer}s`}
                </button>
              </Form>
            )}
          </Formik>
        )}
        {step === 'reset' && (
          <Formik
            initialValues={{ password: '', confirmPassword: '' }}
            validationSchema={Yup.object({
              password: Yup.string().min(6, 'Password must be at least 6 characters').required('Required'),
              confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Required')
            })}
            onSubmit={handleChangePassword}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <Field name="password" type="password" placeholder="New Password" className="w-full px-4 py-3 border rounded" />
                <ErrorMessage name="password" component="div" className="text-red-600 text-sm" />
                <Field name="confirmPassword" type="password" placeholder="Confirm Password" className="w-full px-4 py-3 border rounded" />
                <ErrorMessage name="confirmPassword" component="div" className="text-red-600 text-sm" />
                <button type="submit" className="w-full bg-black text-white py-3 rounded" disabled={isSubmitting || loading}>
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
