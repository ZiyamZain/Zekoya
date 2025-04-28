import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { adminLogin } from "../features/adminAuth/authSlice.js";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { adminInfo, loading, error } = useSelector((state) => state.adminAuth);

  // Redirect after login
  useEffect(() => {
    if (adminInfo) {
      navigate("/admin/dashboard"); // Adjust path based on your routing
    }
  }, [adminInfo, navigate]);

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string()
      .min(5, 'Password must be at least 5 characters')
      .matches(/^\S*$/, 'Password must not contain spaces')
      .required('Password is required'),
  });

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-black tracking-tighter mb-2 font-['Bebas_Neue']">
            ZEKOYA
          </h1>
          <div className="w-16 h-1 bg-black mx-auto"></div>
          <p className="mt-4 text-gray-600 uppercase tracking-wide text-sm font-medium">
            Admin Access
          </p>
        </div>

        <div className="space-y-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              await dispatch(adminLogin(values));
              setSubmitting(false);
            }}
          >
            {({ isSubmitting, handleChange }) => (
              <Form className="space-y-6">
                <div className="space-y-4">
                  <Field
                    type="email"
                    name="email"
                    placeholder="EMAIL"
                    className="w-full px-4 py-4 bg-gray-100 border-2 border-transparent rounded-none text-black placeholder-gray-500 focus:border-black focus:bg-white transition-all duration-300 font-medium tracking-wide"
                    onChange={handleChange}
                  />
                  <ErrorMessage name="email" component="div" className="text-red-600 text-sm" />
                  <Field
                    type="password"
                    name="password"
                    placeholder="PASSWORD"
                    className="w-full px-4 py-4 bg-gray-100 border-2 border-transparent rounded-none text-black placeholder-gray-500 focus:border-black focus:bg-white transition-all duration-300 font-medium tracking-wide"
                    onChange={handleChange}
                  />
                  <ErrorMessage name="password" component="div" className="text-red-600 text-sm" />
                </div>
                <button
                  type="submit"
                  className="w-full bg-black text-white py-4 font-bold tracking-wider hover:bg-gray-900 transition-colors duration-300"
                  disabled={loading || isSubmitting}
                >
                  {loading ? "LOGGING IN..." : "LOG IN"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
