import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  addAddress,
  resetUserProfile,
} from "../../features/userProfile/userProfileSlice";
import { FaMapMarkerAlt, FaSave, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import debounce from "lodash/debounce";
import {
  fetchAddressSuggestions,
  fetchAddressFromCoords,
} from "../../utils/nominatimService.js";

const AddAddress = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const returnUrl = queryParams.get("returnUrl");

  const { userInfo } = useSelector((state) => state.userAuth);
  const { loading, error, success } = useSelector((state) => state.userProfile);

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
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    if (success) {
      dispatch(resetUserProfile());
      navigate(returnUrl || "/profile");
    }
  }, [success, dispatch, navigate, returnUrl]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      try {
        const data = await fetchAddressSuggestions(query);
        setSuggestions(data);
      } catch {
        toast.error("Error fetching address suggestions");
        setSuggestions([]);
      }
    }, 500),
    []
  );

  const handleAddressInput = (e) => {
    const query = e.target.value;
    setFormData({ ...formData, addressLine1: query });
    fetchSuggestions(query);
  };

  const handleSuggestionSelect = (suggestion) => {
    setFormData({
      ...formData,
      addressLine1:
        suggestion.address.house_number ||
        suggestion.address.road ||
        suggestion.display_name.split(",")[0] ||
        "",
      city:
        suggestion.address.city ||
        suggestion.address.town ||
        suggestion.address.village ||
        "",
      state: suggestion.address.state || "",
      postalCode: suggestion.address.postcode || "",
      country: suggestion.address.country || "India",
    });

    setSuggestions([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const phoneRegex = /^[0-9]{0,10}$/;
      if (!phoneRegex.test(value)) return;
    }
    if (name === "postalCode") {
      const postalCodeRegex = /^[0-9]{0,6}$/;
      if (!postalCodeRegex.test(value)) return;
    }
    const newValue = e.target.type === "checkbox" ? e.target.checked : value;
    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const data = await fetchAddressFromCoords(latitude, longitude);
          if (data) {
            setFormData({
              ...formData,
              addressLine1:
                data.address.house_number ||
                data.address.road ||
                data.display_name.split(",")[0] ||
                "",
              city:
                data.address.city ||
                data.address.town ||
                data.address.village ||
                "",
              state: data.address.state || "",
              postalCode: data.address.postcode || "",
              country: data.address.country || "India",
            });
          } else {
            toast.error("Unable to retrieve address from location");
          }
        } catch { // error removed as it's not used
          toast.error("Error fetching location data");
        } finally {
          setIsFetchingLocation(false);
        }
      },
      () => { // error removed as it's not used
        toast.error(
          "Unable to retrieve your location. Please allow location access."
        );
        setIsFetchingLocation(false);
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Phone number must be 10 digits");
      return;
    }

    const postalCodeRegex = /^[0-9]{6}$/;
    if (!postalCodeRegex.test(formData.postalCode)) {
      toast.error("Postal code must be 6 digits");
      return;
    }

    dispatch(addAddress(formData));
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="bg-black text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-2">Add New Address</h1>
          <p className="text-gray-300">
            Add a shipping or billing address to your account
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gray-100 text-black rounded-full flex items-center justify-center mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Address Details
                </h2>
                <p className="text-gray-600">
                  Fill in the information below to add a new address
                </p>
              </div>
            </div>

            <div>
              <label
                className="block text-gray-700 font-medium mb-2"
                htmlFor="name"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black transition-colors"
                required
              />
            </div>

            <div>
              <label
                className="block text-gray-700 font-medium mb-2"
                htmlFor="phone"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black transition-colors"
                required
              />
            </div>

            <div className="relative">
              <label
                className="block text-gray-700 font-medium mb-2"
                htmlFor="addressLine1"
              >
                Address Line 1
              </label>
              <input
                type="text"
                id="addressLine1"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleAddressInput}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black transition-colors"
                placeholder="Street address, P.O. box, company name"
                required
              />
              {suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                  {suggestions.map((suggestion) => (
                    <li
                      key={suggestion.place_id}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {suggestion.display_name}
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={handleCurrentLocation}
                disabled={isFetchingLocation}
                className="mt-2 text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <FaMapMarkerAlt className="mr-2" />
                {isFetchingLocation
                  ? "Fetching Location..."
                  : "Use Current Location"}
              </button>
            </div>

            <div>
              <label
                className="block text-gray-700 font-medium mb-2"
                htmlFor="addressLine2"
              >
                Address Line 2{" "}
                <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                id="addressLine2"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black transition-colors"
                placeholder="Apartment, suite, unit, building, floor, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="city"
                >
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black transition-colors"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="state"
                >
                  State / Province
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black transition-colors"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="postalCode"
                >
                  Postal / ZIP Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black transition-colors"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="country"
                >
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black transition-colors"
                  required
                />
              </div>
            </div>

            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                className="h-5 w-5 text-black focus:ring-black border-gray-300 rounded"
              />
              <label
                htmlFor="isDefault"
                className="ml-2 block text-gray-700 font-medium"
              >
                Set as default address
              </label>
            </div>

            <div className="flex space-x-4 pt-6 border-t border-gray-100 mt-6">
              <button
                type="button"
                onClick={() => navigate(returnUrl || "/profile")}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <FaTimes className="h-5 w-5 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center justify-center shadow-md"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  <>
                    <FaSave className="h-5 w-5 mr-2" />
                    Add Address
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        <div className="text-center mt-4 text-gray-500 text-sm">
          Powered by{" "}
          <a
            href="https://www.openstreetmap.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline"
          >
            OpenStreetMap
          </a>
        </div>
      </div>
    </div>
  );
};

export default AddAddress;
