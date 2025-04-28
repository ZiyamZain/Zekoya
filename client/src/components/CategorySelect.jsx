import React from 'react';

const CategorySelect = ({ categories, value, onChange }) => {
  if (!Array.isArray(categories)) {
    return <pre>Categories is not an array: {JSON.stringify(categories, null, 2)}</pre>;
  }

  if (categories.length === 0) {
    return <div>No categories found.</div>;
  }

  return (
    <select value={value || ''} onChange={onChange} className="w-full p-2 border border-gray-300 rounded-md">
      <option value="">All Categories</option>
      {categories.map((category) => {
        let displayName = category.name;
        console.log('Rendering category option:', category, 'displayName:', displayName, 'type:', typeof displayName);
        if (typeof displayName === 'object' && displayName !== null) {
          displayName = displayName.en || Object.values(displayName)[0] || '';
        }
        return (
          <option key={category._id || category.id} value={displayName}>
            {displayName}
          </option>
        );
      })}
    </select>
  );
};

export default CategorySelect; 