import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  getUserProfile,
  updateAddress,
  resetUserProfile,
} from "../../features/userProfile/userProfileSlice";

const EditAddress = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.userAuth);
  const { user, loading, error, success } = useSelector(
    (state) => state.userProfile
  );

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  });

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    } else if (!user) {
      dispatch(getUserProfile());
    } else {
      const address = user.addresses.find((addr) => addr._id === id);
      if (address) {
        setFormData({
          name: address.name || "",
          phone: address.phone || "",
          addressLine1: address.addressLine1 || "",
          addressLine2: address.addressLine2 || "",
          city: address.city || "",
          state: address.state || "",
          postalCode: address.postalCode || "",
          country: address.country || "India",
          isDefault: address.isDefault || false,
        });
      } else {
        navigate("/profile");
      }
    }
  }, [dispatch, navigate, userInfo, user, id]);

  useEffect(() => {
    if (success) {
      dispatch(resetUserProfile());
      navigate("/profile");
    }
  }, [success, dispatch, navigate]);

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateAddress({ addressId: id, addressData: formData }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Edit Address</h1>

      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg overflow-hidden p-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="name">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="phone">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="addressLine1">
              Address Line 1
            </label>
            <input
              type="text"
              id="addressLine1"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="addressLine2">
              Address Line 2 (Optional)
            </label>
            <input
              type="text"
              id="addressLine2"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="city">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="state">
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="postalCode">
                Postal Code
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="country">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <label htmlFor="isDefault" className="ml-2 block text-gray-700">
              Set as default address
            </label>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="flex-1 py-2 px-4 border border-gray-300 rounded hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition disabled:bg-gray-400"
            >
              {loading ? "Updating..." : "Update Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAddress;
