import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * Reusable pagination bar.
 *
 * Props:
 *  - currentPage: number (1-indexed)
 *  - totalPages: number (>=1)
 *  - onPageChange: function(newPage)
 *  - totalItems?: number (optional)
 *  - itemsPerPage?: number (optional) – required if totalItems passed to show range text
 */
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  if (!totalPages || totalPages < 1) return null;

  const maxPagesToShow = 5;
  const pageNumbers = [];

  const getNumbers = () => {
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      if (currentPage <= 2) end = 4;
      if (currentPage >= totalPages - 1) start = totalPages - 3;
      if (start > 2) pageNumbers.push('...');
      for (let i = start; i <= end; i++) pageNumbers.push(i);
      if (end < totalPages - 1) pageNumbers.push('...');
      pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  const numbers = getNumbers();

  const handleChange = (page) => {
    if (page !== '...' && page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex justify-center mt-6">
      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        <button
          onClick={() => handleChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>

        {numbers.map((num, idx) => (
          <button
            key={idx}
            onClick={() => handleChange(num)}
            disabled={num === '...'}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${num === currentPage ? 'text-blue-600 bg-blue-50' : num === '...' ? 'text-gray-500 cursor-default' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            {num}
          </button>
        ))}

        <button
          onClick={() => handleChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
