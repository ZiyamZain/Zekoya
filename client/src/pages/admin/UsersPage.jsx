import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUsers,
  blockUser,
  unblockUser,
  reset,
} from "../../features/adminSide/adminUsers/usersSlice.js";
import { refreshToken } from "../../features/adminAuth/authSlice.js";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import DynamicPage from "../../components/admin/DynamicPage";
import { FaSearch } from "react-icons/fa";

const UsersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const adminAuthState = useSelector((state) => state.adminAuth);
  const usersState = useSelector((state) => state.adminUsers);

  const { users = [], total = 0, isLoading, isError, message } = usersState;
  const { adminInfo } = adminAuthState;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(refreshToken());
  }, [dispatch]);

  useEffect(() => {
    if (!adminInfo) {
      const storedAdmin = localStorage.getItem("adminInfo");
      if (!storedAdmin) {
        navigate("/admin/login");
        return;
      }
    }

    if (adminInfo?.token) {
      dispatch(getAllUsers({ page, search }));
    } else {
      navigate("/admin/login");
    }
  }, [dispatch, page, search, adminInfo, navigate]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    dispatch(reset());
  }, [isError, message, dispatch]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const clearSearch = () => {
    setSearch("");
    setPage(1);
  };

  const renderRow = (user) => (
    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <img
              src={user.profileImage || "/default-avatar.png"}
              alt={user.name}
              className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
            />
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{user.name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{user.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">
          {new Date(user.createdAt).toLocaleDateString()}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            user.isBlocked
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {user.isBlocked ? "Blocked" : "Active"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => {
            if (user.isBlocked) {
              dispatch(unblockUser(user._id));
              toast.success("User unblocked successfully");
            } else {
              dispatch(blockUser(user._id));
              toast.success("User blocked successfully");
            }
          }}
          className={`px-3 py-1 rounded-md text-white ${
            user.isBlocked
              ? "bg-green-500 hover:bg-green-600"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {user.isBlocked ? "Unblock" : "Block"}
        </button>
      </td>
    </tr>
  );

  return (
    <DynamicPage
      title="Users Management"
      description="Manage all registered users"
      searchPlaceholder="Search users..."
      searchValue={search}
      onSearchChange={handleSearch}
      onClearSearch={clearSearch}
      tableHeaders={["User", "Name", "Email", "Joined", "Status"]}
      tableData={users}
      renderRow={renderRow}
      isLoading={isLoading}
      isError={isError}
      errorMessage={message}
      pagination={
        <div className="flex space-x-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className={`px-3 py-1 rounded-md ${
              page === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            Previous
          </button>
          {Array.from({ length: Math.ceil(total / 10) }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded-md ${
                page === i + 1
                  ? "bg-gradient-to-r from-red-500 to-orange-400 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={page === Math.ceil(total / 10)}
            onClick={() => setPage(page + 1)}
            className={`px-3 py-1 rounded-md ${
              page === Math.ceil(total / 10)
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            Next
          </button>
        </div>
      }
    />
  );
};

export default UsersPage;
