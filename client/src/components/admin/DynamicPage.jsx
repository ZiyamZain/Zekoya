import React from "react";
import { FaSearch } from "react-icons/fa";
import { MdAdd } from "react-icons/md";

const DynamicPage = ({
  title,
  description,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  onClearSearch,
  onAdd,
  tableHeaders,
  tableData,
  renderRow,
  isLoading,
  isError,
  errorMessage,
  pagination,
  actions,
}) => {
  return (
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-black">
            {title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={onSearchChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            {searchValue && (
              <button
                onClick={onClearSearch}
                className="absolute inset-y-0 right-0 pr-10 flex items-center text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>

          {/* Add Button */}
          {onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-400 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-orange-500 transition-all shadow-md"
            >
              <MdAdd size={18} />
              <span className="font-medium">Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">Error: {errorMessage}</div>
        ) : tableData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No data found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {tableHeaders.map((header, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tableData.map((row, index) => renderRow(row, index))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            {pagination}
          </div>
        )}
      </div>

      {/* Additional Actions */}
      {actions && <div>{actions}</div>}
    </div>
  );
};

export default DynamicPage;