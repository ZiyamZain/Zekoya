import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addCategory, getCategories } from '../../features/adminSide/categories/categorySlice';
import { toast } from 'react-toastify';

const AddCategoryModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
  

   
      if (!formData.name.trim() || !formData.description.trim() || !formData.image) {
        toast.error('Please fill in all fields and upload an image');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('image', formData.image);


      const result = await dispatch(addCategory(formDataToSend)).unwrap();
      
      if (result) {
        toast.success('Category added successfully');
        // Refresh the categories list with the updated total count
        dispatch({ type: 'adminCategories/resetPage' });
        // Fetch the updated categories list with the correct total
        await dispatch(getCategories({ page: 1, search: '', limit: 5 }));
        onClose();
      } else {
        throw new Error('Failed to add category');
      }
    } catch (error) {
      console.error('Add failed:', error);
      toast.error(
        error?.response?.data?.message || 
        error?.message || 
        'Failed to add category. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-['Bebas_Neue'] tracking-wider">Add New Category</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Category Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black/50"
              placeholder="Enter category name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="3"
              className="w-full px-3 py-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black/50"
              placeholder="Enter category description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category Image</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, image: null }));
                    }}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="category-image"
                  />
                  <label
                    htmlFor="category-image"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="mt-2 text-sm text-gray-500">Click to upload image</span>
                    <span className="mt-1 text-xs text-gray-400">(Recommended: 16:9 ratio)</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border-2 border-black text-black rounded-md hover:bg-black hover:text-white transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-black text-white px-6 py-2 rounded-md hover:bg-gray-900 transition-colors duration-200 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Adding...' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal; 