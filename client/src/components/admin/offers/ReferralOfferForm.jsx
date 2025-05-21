import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { format } from "date-fns";

import {
  createReferralOffer,
  getReferralOfferById,
  updateReferralOffer,
  reset,
  clearReferralOffer,
} from "../../../features/adminSide/offers/referralOfferSlice";

const ReferralOfferForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { referralOffer, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.referralOffer || {}
  );

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    rewardType: "percentage",
    referrerReward: "",
    refereeReward: "",
    minimumPurchaseAmount: 0,
    maxReferrals: "",
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default to 30 days from now
    isActive: true,
  });

  useEffect(() => {
    if (isEditMode) {
      dispatch(getReferralOfferById(id));
    }

    // Reset state when component mounts to clear any previous success/error state
    dispatch(reset());

    return () => {
      dispatch(clearReferralOffer());
    };
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    // Populate form when editing and data is loaded
    if (isEditMode && referralOffer) {
      setFormData({
        name: referralOffer.name || "",
        description: referralOffer.description || "",
        rewardType: referralOffer.rewardType || "percentage",
        referrerReward: referralOffer.referrerReward || "",
        refereeReward: referralOffer.refereeReward || "",
        minimumPurchaseAmount: referralOffer.minimumPurchaseAmount || 0,
        maxReferrals: referralOffer.maxReferrals || "",
        startDate: referralOffer.startDate
          ? new Date(referralOffer.startDate)
          : new Date(),
        endDate: referralOffer.endDate
          ? new Date(referralOffer.endDate)
          : new Date(new Date().setDate(new Date().getDate() + 30)),
        isActive:
          referralOffer.isActive !== undefined ? referralOffer.isActive : true,
      });
    }
  }, [isEditMode, referralOffer]);

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
      navigate("/admin/offers/referral");
      
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
      const dateValue = new Date(value);
      if (!isNaN(dateValue.getTime())) { // Check if date is valid
        setFormData((prevData) => ({
          ...prevData,
          [name]: dateValue,
        }));
      } else {
        toast.error('Invalid date format');
      }
    } catch (error) {
      console.error('Date parsing error:', error);
      toast.error('Invalid date format');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    const errors = [];
    
    if (!formData.name) errors.push("Please enter a name for the offer");
    if (!formData.description) errors.push("Please enter a description");
    
    if (!formData.referrerReward) {
      errors.push("Please enter a referrer reward");
    } else if (formData.rewardType === "percentage") {
      const value = Number(formData.referrerReward);
      if (isNaN(value) || value <= 0 || value > 100) {
        errors.push("Percentage reward must be between 1 and 100");
      }
    } else if (formData.rewardType === "fixed") {
      const value = Number(formData.referrerReward);
      if (isNaN(value) || value <= 0) {
        errors.push("Fixed reward must be greater than 0");
      }
    }
    
    if (!formData.refereeReward) {
      errors.push("Please enter a referee reward");
    } else if (formData.rewardType === "percentage") {
      const value = Number(formData.refereeReward);
      if (isNaN(value) || value <= 0 || value > 100) {
        errors.push("Percentage reward must be between 1 and 100");
      }
    } else if (formData.rewardType === "fixed") {
      const value = Number(formData.refereeReward);
      if (isNaN(value) || value <= 0) {
        errors.push("Fixed reward must be greater than 0");
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
      // Ensure dates are valid before formatting
      if (isNaN(formData.startDate.getTime()) || isNaN(formData.endDate.getTime())) {
        toast.error('Invalid date format');
        return;
      }
      
      const offerData = {
        ...formData,
        referrerReward: Number(formData.referrerReward),
        refereeReward: Number(formData.refereeReward),
        minimumPurchaseAmount: Number(formData.minimumPurchaseAmount),
        maxReferrals: formData.maxReferrals
          ? Number(formData.maxReferrals)
          : null,
        startDate: format(formData.startDate, "yyyy-MM-dd"),
        endDate: format(formData.endDate, "yyyy-MM-dd")
        // Note: createdBy is handled by the server using the authentication token
      };

      // Set the hasSubmitted flag to true
      setHasSubmitted(true);
      
      if (isEditMode) {
        dispatch(updateReferralOffer({ id, offerData }));
      } else {
        dispatch(createReferralOffer(offerData));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred while saving the offer');
    }
  };

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
        {isEditMode ? "Edit Referral Offer" : "Create Referral Offer"}
      </h1>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Reward Type
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="rewardType"
                    value="percentage"
                    checked={formData.rewardType === "percentage"}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Percentage (%)</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="rewardType"
                    value="fixed"
                    checked={formData.rewardType === "fixed"}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Fixed Amount (₹)</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="rewardType"
                    value="points"
                    checked={formData.rewardType === "points"}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Points</span>
                </label>
              </div>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referrer Reward*
                {formData.rewardType === "percentage"
                  ? " (%)"
                  : formData.rewardType === "fixed"
                  ? " (₹)"
                  : " (Points)"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="referrerReward"
                  value={formData.referrerReward}
                  onChange={handleChange}
                  min={0}
                  max={formData.rewardType === "percentage" ? 100 : undefined}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {formData.rewardType === "percentage"
                    ? "%"
                    : formData.rewardType === "fixed"
                    ? "₹"
                    : "points"}
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referee Reward*
                {formData.rewardType === "percentage"
                  ? " (%)"
                  : formData.rewardType === "fixed"
                  ? " (₹)"
                  : " (Points)"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="refereeReward"
                  value={formData.refereeReward}
                  onChange={handleChange}
                  min={0}
                  max={formData.rewardType === "percentage" ? 100 : undefined}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {formData.rewardType === "percentage"
                    ? "%"
                    : formData.rewardType === "fixed"
                    ? "₹"
                    : "points"}
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Purchase Amount (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="minimumPurchaseAmount"
                  value={formData.minimumPurchaseAmount}
                  onChange={handleChange}
                  min={0}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  ₹
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Referrals (leave empty for unlimited)
              </label>
              <input
                type="number"
                name="maxReferrals"
                value={formData.maxReferrals}
                onChange={handleChange}
                min={1}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date*
              </label>
              <input
                type="date"
                name="startDate"
                value={format(formData.startDate, "yyyy-MM-dd")}
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
                value={format(formData.endDate, "yyyy-MM-dd")}
                onChange={handleDateChange}
                min={format(formData.startDate, "yyyy-MM-dd")}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
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

            <div className="col-span-2 flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={() => navigate("/admin/offers/referral")}
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

export default ReferralOfferForm;
