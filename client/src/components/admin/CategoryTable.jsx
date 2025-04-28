// client/src/features/adminSide/categories/components/CategoryTable.jsx
import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toggleCategoryListing } from "../../features/adminSide/categories/categorySlice";
import { toast } from "react-toastify";

const CategoryTable = ({ isLoading, onEdit }) => {
  const categories = useSelector((state) => state.categories.categories);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const dispatch = useDispatch();

  const handleToggleListing = async (category) => {
    try {
      const updatedCategory = {
        ...category,
        isListed: !category.isListed,
      };

      // Dispatch the action and wait for the response
      await dispatch(toggleCategoryListing(updatedCategory)).unwrap();

      // Show success toast
      toast.success(
        `Category ${updatedCategory.isListed ? "listed" : "unlisted"} successfully`
      );
    } catch (error) {
      // Show error toast
      toast.error(error.message || "Failed to update category status");
    }
  };

  useEffect(() => {
    console.log("Categories state updated:", categories);
  }, [categories]);

  if (isLoading) {
    return <div className="p-8 text-center">Loading categories...</div>;
  }

  if (!categories || categories.length === 0) {
    return <div className="p-8 text-center">No categories found</div>;
  }

  return (
    <div className="bg-white border-2 border-black">
      <div className="p-4">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 p-2 border rounded"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-[5%]" />
            <col className="w-[15%]" />
            <col className="w-[20%]" />
            <col className="w-[30%]" />
            <col className="w-[15%]" />
            <col className="w-[15%]" />
          </colgroup>
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-4 px-6 text-left font-['Bebas_Neue'] tracking-wider">
                #
              </th>
              <th className="py-4 px-6 text-left font-['Bebas_Neue'] tracking-wider">
                Image
              </th>
              <th className="py-4 px-6 text-left font-['Bebas_Neue'] tracking-wider">
                Name
              </th>
              <th className="py-4 px-6 text-left font-['Bebas_Neue'] tracking-wider">
                Description
              </th>
              <th className="py-4 px-6 text-left font-['Bebas_Neue'] tracking-wider">
                Status
              </th>
              <th className="py-4 px-6 text-left font-['Bebas_Neue'] tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((category, index) => (
              <tr
                key={category._id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="py-4 px-6 font-medium">{index + 1}</td>
                <td className="py-4 px-6">
                  <div className="w-20 h-20 rounded-lg overflow-hidden">
                    <img
                      src={`http://localhost:5001${category.image}`}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                        console.error('Failed to load image:', category.image);
                      }}
                    />
                  </div>
                </td>
                <td className="py-4 px-6 font-medium">{category.name}</td>
                <td className="py-4 px-6">{category.description}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    category.isListed 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {category.isListed ? "Listed" : "Unlisted"}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onEdit(category)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                      title="Edit"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleToggleListing(category)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium tracking-wide transition-all duration-200 ${
                        category.isListed 
                          ? "bg-white border-2 border-red-500 text-red-500 hover:bg-red-50" 
                          : "bg-white border-2 border-green-500 text-green-500 hover:bg-green-50"
                      }`}
                    >
                      {category.isListed ? "Unlist" : "List"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryTable;
