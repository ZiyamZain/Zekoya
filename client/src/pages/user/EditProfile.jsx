import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getUserProfile,
  updateUserProfile,
  resetUserProfile,
} from "../../features/userProfile/userProfileSlice";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../utils/cropImage";
import { toast } from "react-toastify";

const EditProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.userAuth);
  const { user, loading, success, error } = useSelector(
    (state) => state.userProfile
  );

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  
  // Image cropping states
  const [profileImage, setProfileImage] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    } else if (!user) {
      dispatch(getUserProfile());
    } else {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
      });
      setPreviewUrl(user.profileImage || "");
    }
  }, [dispatch, navigate, userInfo, user]);

  useEffect(() => {
    if (success) {
      dispatch(resetUserProfile());
      navigate("/profile");
    }
  }, [success, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        toast.error("Please select an image file");
        return;
      }
      
      // Use FileReader to read the file as data URL
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
      };
      reader.onerror = () => {
        toast.error("Error reading the image file");
      };
      reader.readAsDataURL(file);
      
      // Also store the original file as a fallback if cropping fails
      setProfileImage(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropImage = async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) {
        toast.error("Please select and crop an image");
        return;
      }
      
      try {
        const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
        console.log('Cropped image blob:', croppedImageBlob);
        
        // Ensure we have a valid Blob with the correct type
        if (!(croppedImageBlob instanceof Blob)) {
          throw new Error("Failed to create a valid image blob");
        }
        
        setProfileImage(croppedImageBlob);
        setPreviewUrl(URL.createObjectURL(croppedImageBlob));
        setImageSrc(null); // Close the cropper
        toast.success("Image cropped successfully");
      } catch (cropError) {
        console.error("Error in image cropping:", cropError);
        toast.warning("Could not crop the image, using the original file instead");
        // We already set profileImage to the original file in handleImageChange
        // Just create a preview URL from the original file
        setPreviewUrl(URL.createObjectURL(profileImage));
        setImageSrc(null); // Close the cropper
      }
    } catch (error) {
      console.error("Error handling image:", error);
      toast.error("Failed to process image");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("phone", formData.phone);
    
    if (profileImage) {
      formDataToSend.append("profileImage", profileImage);
    }
    
    dispatch(updateUserProfile(formDataToSend));
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Hero section */}
      <div className="bg-black text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-2">Edit Profile</h1>
          <p className="text-gray-300">Update your personal information</p>
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
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-md">
                  <img
                    src={previewUrl || "/default-avatar.png"}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <label htmlFor="profile-image-upload" className="absolute bottom-0 right-0 bg-black rounded-full p-2 shadow-md cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  <input 
                    id="profile-image-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageChange} 
                  />
                </label>
              </div>
            </div>
            
            {/* Image Cropper Modal */}
            {imageSrc && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                  <h3 className="text-xl font-bold mb-4">Crop Profile Image</h3>
                  <div className="relative h-80 w-full mb-4">
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zoom</label>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.1"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                      onClick={() => setImageSrc(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                      onClick={handleCropImage}
                    >
                      Crop & Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
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
              <label className="block text-gray-700 font-medium mb-2" htmlFor="phone">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black transition-colors"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
