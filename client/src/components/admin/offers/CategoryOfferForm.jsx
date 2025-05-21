import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { format } from "date-fns";

import {
  createCategoryOffer,
  getCategoryOfferById,
  updateCategoryOffer,
  reset,
  clearCategoryOffer,
} from "../../../features/adminSide/offers/categoryOfferSlice";

// We'll need to fetch categories for the dropdown
import { getCategories } from "../../../features/adminSide/categories/categorySlice";

const CategoryOfferForm = () => {
  console.log('CategoryOfferForm component mounted');
  
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { categoryOffer, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.categoryOffer || {}
  );

  const { categories } = useSelector((state) => state.adminCategories || { categories: [] });

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    category: "",
    name: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default to 30 days from now
    isActive: true,
  });

  useEffect(() => {
    // Load categories for dropdown
    dispatch(getCategories());

    // If we're in edit mode, fetch the offer data
    if (isEditMode) {
      dispatch(getCategoryOfferById(id));
    }

    // Reset state when component mounts to clear any previous success/error state
    dispatch(reset());

    // Cleanup function
    return () => {
      dispatch(clearCategoryOffer());
    };
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    // Populate form when editing and data is loaded
    if (isEditMode && categoryOffer) {
      try {
        const startDate = categoryOffer.startDate
          ? new Date(categoryOffer.startDate)
          : new Date();
          
        const endDate = categoryOffer.endDate
          ? new Date(categoryOffer.endDate)
          : new Date(new Date().setDate(new Date().getDate() + 30));
          
        // Check if dates are valid
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.error('Invalid date in offer data');
          toast.error('Error loading offer dates');
          return;
        }
        
        setFormData({
          category: categoryOffer.category?._id || "",
          name: categoryOffer.name || "",
          description: categoryOffer.description || "",
          discountType: categoryOffer.discountType || "percentage",
          discountValue: categoryOffer.discountValue || "",
          startDate: startDate,
          endDate: endDate,
          isActive: categoryOffer.isActive !== undefined ? categoryOffer.isActive : true,
        });
      } catch (error) {
        console.error('Error setting form data:', error);
        toast.error('Error loading offer data');
      }
    }
  }, [isEditMode, categoryOffer]);

  // Use a ref to track if we've already shown a toast for the current success/error state
  const toastShownRef = React.useRef(false);
  // Use a ref to track if this is the initial mount of the component
  const initialMountRef = React.useRef(true);
  // Track if the form has been submitted
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  useEffect(() => {
    // Skip success/error handling on initial mount to prevent unwanted behavior
    if (initialMountRef.current) {
      initialMountRef.current = false;
      return;
    }
    
    // Only show error toast if we haven't shown it yet for this error
    if (isError && !toastShownRef.current) {
      toast.error(message);
      toastShownRef.current = true;
      dispatch(reset()); // Reset state after error
    }

    // Only show success toast if we haven't shown it yet for this success AND the form has been submitted
    if (isSuccess && !isLoading && !toastShownRef.current && hasSubmitted) {
      toast.success(
        isEditMode
          ? "Offer updated successfully!"
          : "Offer created successfully!"
      );
      toastShownRef.current = true;
      
      // Navigate back to the list page
      navigate("/admin/offers/category");
      
      // Reset the state after a short delay
      setTimeout(() => {
        dispatch(reset());
      }, 300);
    }
    
    // Reset the ref when the success/error state changes
    if (!isSuccess && !isError) {
      toastShownRef.current = false;
    }
  }, [isError, isSuccess, isLoading, message, navigate, isEditMode, dispatch, hasSubmitted]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    try {
      // For date inputs, the value is a string in format YYYY-MM-DD
      // Store it directly as a string to avoid timezone issues
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    } catch (error) {
      console.error('Date handling error:', error);
      toast.error('Invalid date format');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    const errors = [];
    
    if (!formData.category) errors.push("Please select a category");
    if (!formData.name) errors.push("Please enter a name for the offer");
    if (!formData.description) errors.push("Please enter a description");
    
    if (!formData.discountValue) {
      errors.push("Please enter a discount value");
    } else if (formData.discountType === "percentage") {
      const value = Number(formData.discountValue);
      if (isNaN(value) || value <= 0 || value > 100) {
        errors.push("Percentage discount must be between 1 and 100");
      }
    } else if (formData.discountType === "fixed") {
      const value = Number(formData.discountValue);
      if (isNaN(value) || value <= 0) {
        errors.push("Fixed discount must be greater than 0");
      }
    }
    
    if (formData.startDate >= formData.endDate) {
      errors.push("End date must be after start date");
    }
    
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    // Prepare data for submission
    try {
      // Convert string dates to Date objects if they're not already
      const startDate = formData.startDate instanceof Date ? formData.startDate : new Date(formData.startDate);
      const endDate = formData.endDate instanceof Date ? formData.endDate : new Date(formData.endDate);
      
      // Ensure dates are valid
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        toast.error('Invalid date format');
        return;
      }
      
      const offerData = {
        ...formData,
        discountValue: Number(formData.discountValue),
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd")
        // Note: createdBy is handled by the server using the authentication token
      };

      // Set the hasSubmitted flag to true
      setHasSubmitted(true);
      
      if (isEditMode) {
        dispatch(updateCategoryOffer({ id, offerData }));
      } else {
        dispatch(createCategoryOffer(offerData));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred while saving the offer');
    }
  };

  // Show loading state when fetching data in edit mode
  if (isLoading && isEditMode) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? "Edit Category Offer" : "Create Category Offer"}
      </h1>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Category*
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {categories &&
                  categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Offer Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="discountType"
                    value="percentage"
                    checked={formData.discountType === "percentage"}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Percentage (%)</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="discountType"
                    value="fixed"
                    checked={formData.discountType === "fixed"}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Fixed Amount (₹)</span>
                </label>
              </div>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.discountType === "percentage"
                  ? "Discount Percentage*"
                  : "Discount Amount (₹)*"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleChange}
                  min={0}
                  max={formData.discountType === "percentage" ? 100 : undefined}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {formData.discountType === "percentage" ? "%" : "₹"}
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Active
                </span>
              </label>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description*
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date*
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate instanceof Date ? format(formData.startDate, "yyyy-MM-dd") : formData.startDate}
                onChange={handleDateChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date*
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate instanceof Date ? format(formData.endDate, "yyyy-MM-dd") : formData.endDate}
                onChange={handleDateChange}
                min={formData.startDate instanceof Date ? format(formData.startDate, "yyyy-MM-dd") : formData.startDate}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="col-span-2 flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={() => navigate("/admin/offers/category")}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Loading...
                  </div>
                ) : isEditMode ? (
                  "Update Offer"
                ) : (
                  "Create Offer"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryOfferForm;
