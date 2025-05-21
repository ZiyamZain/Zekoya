const BASE_URL = "https://nominatim.openstreetmap.org";

// Helper function to handle API errors
const handleApiError = (error) => {
  console.error("Nominatim API Error:", error);
  throw new Error("Error fetching data from Nominatim");
};

// Fetch address suggestions (autocomplete)
export const fetchAddressSuggestions = async (query) => {
  if (query.length < 3) return [];

  try {
    const response = await fetch(
      `${BASE_URL}/search?q=${encodeURIComponent(
        query
      )}&format=json&addressdetails=1&countrycodes=IN`
    );
    if (!response.ok) throw new Error("Failed to fetch address suggestions");
    const data = await response.json();
    return data || [];
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

// Fetch address from coordinates (reverse geocoding)
export const fetchAddressFromCoords = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `${BASE_URL}/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
    );
    if (!response.ok)
      throw new Error("Failed to fetch address from coordinates");
    const data = await response.json();
    if (!data || !data.address)
      throw new Error("No address found for the given coordinates");
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};
