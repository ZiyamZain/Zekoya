import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import adminAxios from '../../utils/adminAxiosConfig';

const couponSchema = Yup.object().shape({
  code: Yup.string()
    .required('Coupon code is required')
    .matches(/^[A-Z0-9]+$/, 'Coupon code can only contain uppercase letters and numbers')
    .min(6, 'Coupon code must be at least 6 characters'),
  description: Yup.string()
    .required('Description is required'),
  discountType: Yup.string()
    .required('Discount type is required')
    .oneOf(['percentage', 'fixed'], 'Invalid discount type'),
  discountValue: Yup.number()
    .required('Discount value is required')
    .min(1, 'Discount value must be greater than 0'),
  minPurchase: Yup.number()
    .required('Minimum purchase is required')
    .min(0, 'Minimum purchase must be a positive number'),
  maxDiscount: Yup.number()
    .min(0, 'Maximum discount must be a positive number'),
  startDate: Yup.date()
    .required('Start date is required'),
  endDate: Yup.date()
    .required('End date is required')
    .min(Yup.ref('startDate'), 'End date must be after start date'),
  usageLimit: Yup.number()
    .min(1, 'Usage limit must be a positive number')
});

const CouponForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formError, setFormError] = useState('');
  
  const [couponData, setCouponData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchase: 0,
    maxDiscount: 0,
    startDate: '',
    endDate: '',
    usageLimit: 1,
    isActive: true
  });

  // Initialize Formik's initialValues from couponData
  const initialValues = {
    code: couponData.code,
    description: couponData.description,
    discountType: couponData.discountType,
    discountValue: couponData.discountValue,
    minPurchase: couponData.minPurchase,
    maxDiscount: couponData.maxDiscount,
    startDate: couponData.startDate,
    endDate: couponData.endDate,
    usageLimit: couponData.usageLimit,
    isActive: couponData.isActive
  };

  useEffect(() => {
    if (id) {
      adminAxios.get(`/coupons/${id}`)
        .then((response) => {
          // Format dates to YYYY-MM-DD format
          const formattedStartDate = new Date(response.data.startDate).toISOString().split('T')[0];
          const formattedEndDate = new Date(response.data.endDate).toISOString().split('T')[0];
          
          // Update the coupon data state
          setCouponData({
            code: response.data.code,
            description: response.data.description,
            discountType: response.data.discountType,
            discountValue: response.data.discountValue,
            minPurchase: response.data.minPurchase || 0,
            maxDiscount: response.data.maxDiscount || 0,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            usageLimit: response.data.usageLimit || 1,
            isActive: response.data.isActive || false
          });
        })
        .catch((error) => {
          toast.error(error.response?.data?.message || 'Failed to load coupon');
          navigate('/admin/coupons');
        });
    }
  }, [id, navigate]);

  // State to track form submission status
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setIsSubmitting(true);
      setFormError('');

      // Format dates
      const formattedValues = {
        ...values,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
        isActive: Boolean(values.isActive)
      };

      // Submit form
      let response;
      if (id) {
        response = await adminAxios.put(`/coupons/${id}`, formattedValues);
      } else {
        response = await adminAxios.post('/coupons', formattedValues);
      }

      toast.success(id ? 'Coupon updated successfully' : 'Coupon created successfully');
      navigate('/admin/coupons');
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to save coupon');
      console.error('Error saving coupon:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h1 className='text-2xl font-bold text-gray-800'>{id ? 'Edit Coupon' : 'Create Coupon'}</h1>
        </div>
        <div className='px-6 py-6'>
          <Formik
            initialValues={initialValues}
            validationSchema={couponSchema}
            onSubmit={handleSubmit}
            enableReinitialize={true}
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
              <Form className='space-y-6'>
                <div>
                  <label htmlFor='code' className='block text-sm font-medium text-gray-700'>Coupon Code</label>
                  <div className='mt-1 relative rounded-md shadow-sm'>
                    <Field
                      type='text'
                      name='code'
                      className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                      onChange={(e) => {
                        handleChange(e);
                      }}
                    />
                    {errors.code && touched.code && (
                      <p className='mt-2 text-sm text-red-600'>{errors.code}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor='description' className='block text-sm font-medium text-gray-700'>Description</label>
                  <div className='mt-1 relative rounded-md shadow-sm'>
                    <Field
                      type='text'
                      name='description'
                      className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                    />
                    {errors.description && touched.description && (
                      <p className='mt-2 text-sm text-red-600'>{errors.description}</p>
                    )}
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-6'>
                  <div>
                    <label htmlFor='discountType' className='block text-sm font-medium text-gray-700'>Discount Type</label>
                    <div className='mt-1 relative rounded-md shadow-sm'>
                      <Field
                        as='select'
                        name='discountType'
                        className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                      >
                        <option value='percentage'>Percentage</option>
                        <option value='fixed'>Fixed Amount</option>
                      </Field>
                      {errors.discountType && touched.discountType && (
                        <p className='mt-2 text-sm text-red-600'>{errors.discountType}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor='discountValue' className='block text-sm font-medium text-gray-700'>Discount Value</label>
                    <div className='mt-1 relative rounded-md shadow-sm'>
                      <Field
                        type='number'
                        name='discountValue'
                        className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                      />
                      {errors.discountValue && touched.discountValue && (
                        <p className='mt-2 text-sm text-red-600'>{errors.discountValue}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-6'>
                  <div>
                    <label htmlFor='minPurchase' className='block text-sm font-medium text-gray-700'>Minimum Purchase</label>
                    <div className='mt-1 relative rounded-md shadow-sm'>
                      <Field
                        type='number'
                        name='minPurchase'
                        className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                      />
                      {errors.minPurchase && touched.minPurchase && (
                        <p className='mt-2 text-sm text-red-600'>{errors.minPurchase}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor='maxDiscount' className='block text-sm font-medium text-gray-700'>Maximum Discount</label>
                    <div className='mt-1 relative rounded-md shadow-sm'>
                      <Field
                        type='number'
                        name='maxDiscount'
                        className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                      />
                      {errors.maxDiscount && touched.maxDiscount && (
                        <p className='mt-2 text-sm text-red-600'>{errors.maxDiscount}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-6'>
                  <div>
                    <label htmlFor='startDate' className='block text-sm font-medium text-gray-700'>Start Date</label>
                    <div className='mt-1 relative rounded-md shadow-sm'>
                      <Field
                        type='date'
                        name='startDate'
                        className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                      />
                      {errors.startDate && touched.startDate && (
                        <p className='mt-2 text-sm text-red-600'>{errors.startDate}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor='endDate' className='block text-sm font-medium text-gray-700'>End Date</label>
                    <div className='mt-1 relative rounded-md shadow-sm'>
                      <Field
                        type='date'
                        name='endDate'
                        className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                      />
                      {errors.endDate && touched.endDate && (
                        <p className='mt-2 text-sm text-red-600'>{errors.endDate}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor='usageLimit' className='block text-sm font-medium text-gray-700'>Usage Limit</label>
                  <div className='mt-1 relative rounded-md shadow-sm'>
                    <Field
                      type='number'
                      name='usageLimit'
                      className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                    />
                    {errors.usageLimit && touched.usageLimit && (
                      <p className='mt-2 text-sm text-red-600'>{errors.usageLimit}</p>
                    )}
                  </div>
                </div>

                <div className='flex items-center'>
                  <label htmlFor='isActive' className='block text-sm font-medium text-gray-700'>Active</label>
                  <div className='mt-1 ml-2'>
                    <Field
                      type='checkbox'
                      name='isActive'
                      className='rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                    />
                  </div>
                </div>

                {formError && (
                  <div className='text-red-600 text-sm mt-4'>{formError}</div>
                )}

                <div>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isSubmitting ? (
                      <>
                        <div className='animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white inline-block mr-2'></div>
                        Saving...
                      </>
                    ) : (
                      id ? 'Update Coupon' : 'Create Coupon'
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default CouponForm;

// Remove any trailing code or syntax errors
// This is the end of the component file.
