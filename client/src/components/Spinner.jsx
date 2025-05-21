import React from 'react';

const Spinner = ({ size = 'default' }) => {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    default: 'w-8 h-8 border-4',
    large: 'w-12 h-12 border-4'
  };

  const spinnerClass = `inline-block ${sizeClasses[size] || sizeClasses.default} border-t-indigo-600 border-r-indigo-600 border-b-indigo-200 border-l-indigo-200 rounded-full animate-spin`;

  return (
    <div className="flex justify-center items-center">
      <div className={spinnerClass}></div>
    </div>
  );
};

export default Spinner;
