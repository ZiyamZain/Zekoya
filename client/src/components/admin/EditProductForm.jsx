import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { editProduct } from "../../features/adminSide/products/productSlice";
import { getCategories } from "../../features/adminSide/categories/categorySlice";
import { toast } from "react-toastify";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../utils/cropImage";
// import { useNavigate } from "react-router-dom"; // Removed as navigate is unused

const EditProductForm = ({ product, onCancel, onSuccess }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.adminCategories);
  const [formData, setFormData] = useState({
    name: product.name || "",
    description: product.description || "",
    price: product.price || "",
    category: product.category?._id || product.category || "",
    sizes: product.sizes || [
      { size: "S", stock: 0 },
      { size: "M", stock: 0 },
      { size: "L", stock: 0 },
      { size: "XL", stock: 0 },
      { size: "XXL", stock: 0 },
      { size: "3XL", stock: 0 },
    ],
    images: product.images ? product.images.map(img => ({ url: img.url, public_id: img.public_id })) : [],
  });
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState(
    product.images ? product.images.map(img => img.url) : []
  );
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(getCategories({ page: 1, search: "" }));
    }
  }, [dispatch, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSizeChange = (size, value) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.map((s) =>
        s.size === size ? { ...s, stock: parseInt(value) || 0 } : s
      ),
    }));
  };

  const handleRemoveImage = (index) => {
    const imageToRemove = formData.images[index];
    if (imageToRemove && imageToRemove.public_id) {
      setImagesToDelete((prev) => [...prev, imageToRemove.public_id]);
    }

    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));

    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageSubmit = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      toast.error("Please crop the image before submitting.");
      return;
    }
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, croppedBlob],
      }));
      setImagePreviews((prev) => [...prev, URL.createObjectURL(croppedBlob)]);
      setImageSrc(null);
      toast.success("Image submitted successfully. You can add more images.");
    } catch (error) {
      console.error("Error processing cropped image:", error);
      toast.error("Failed to process cropped image.");
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validExtensions = ["image/jpeg", "image/png", "image/jpg"];
    if (files.some((file) => !validExtensions.includes(file.type))) {
      toast.error("Only JPG, JPEG, and PNG files are allowed.");
      return;
    }
    if (files.length + formData.images.length > 5) {
      toast.error("You can upload a maximum of 5 images.");
      return;
    }
    const file = files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalImageCount = formData.images.length;
    if (finalImageCount < 1) {
      toast.error("Please ensure the product has at least 1 image.");
      return;
    }
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("sizes", JSON.stringify(formData.sizes));
      
      formData.images.forEach((image) => {
        if (image instanceof Blob) {
          formDataToSend.append("newImages", image, image.name || `image-${Date.now()}.jpg`);
        }
      });
      
      if (imagesToDelete.length > 0) {
        formDataToSend.append("imagesToDelete", JSON.stringify(imagesToDelete));
      }
      
      await dispatch(editProduct({ id: product._id, productData: formDataToSend })).unwrap();
      toast.success("Product updated successfully");
      setImagesToDelete([]); 
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-8 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-2">
          <h2 className="text-2xl font-bold tracking-wider text-center w-full">Edit Product</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border px-4 py-2 rounded focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full border px-4 py-2 rounded focus:outline-none"
              >
                <option value="">Select Category</option>
                {categories && categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full border px-4 py-2 rounded focus:outline-none min-h-[80px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full border px-4 py-2 rounded focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Sizes & Stock</label>
              <div className="grid grid-cols-2 gap-2">
                {formData.sizes.map((s) => (
                  <div key={s.size} className="flex items-center gap-2">
                    <span className="w-8 inline-block font-semibold">{s.size}</span>
                    <input
                      type="number"
                      min={0}
                      value={s.stock}
                      onChange={e => handleSizeChange(s.size, e.target.value)}
                      className="border rounded px-2 py-1 w-20"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Product Images</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {imageSrc ? (
                <div className="relative w-full h-64 bg-gray-200">
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={4 / 3}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                  <div className="absolute bottom-4 right-4 flex space-x-2">
                    <button
                      type="button"
                      onClick={handleImageSubmit}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageSrc(null);
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="edit-product-images"
                  />
                  <label
                    htmlFor="edit-product-images"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="mt-2 text-sm text-gray-500">Click to upload images</span>
                    <span className="mt-1 text-xs text-gray-400">(Minimum 1, Maximum 5)</span>
                  </label>
                </div>
              )}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {imagePreviews.map((preview, index) => {
                return (
                  <div key={index} className="relative w-24 h-24 border rounded overflow-hidden group">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                    <button 
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-700"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductForm;
