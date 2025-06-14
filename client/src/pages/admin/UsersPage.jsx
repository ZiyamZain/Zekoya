import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUsers,
  blockUser,
  unblockUser,
  reset,
} from "../../features/adminSide/adminUsers/usersSlice.js";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import DynamicPage from "../../components/admin/DynamicPage";
import Pagination from "../../components/common/Pagination";
import { getImageUrl } from "../../utils/imageUtils";

const UsersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const adminAuthState = useSelector((state) => state.adminAuth);
  const usersState = useSelector((state) => state.adminUsers);

  const { users = [], total = 0, isLoading, isError, isBlockUnblockSuccess, message } = usersState;
  const { adminInfo } = adminAuthState;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  

  useEffect(() => {
    if (isBlockUnblockSuccess) {
      toast.success("User status updated successfully");
      // Refresh the users list after successful block/unblock
      dispatch(getAllUsers({ page, search }));
      dispatch(reset());
    }
  }, [isBlockUnblockSuccess, dispatch, page, search]);


  useEffect(() => {
    if (!adminInfo) {
      const storedAdmin = localStorage.getItem("adminInfo");
      if (!storedAdmin) {
        navigate("/admin/login");
        return;
      }
    }

    if (adminInfo?.accessToken) {
      dispatch(getAllUsers({ page, search }));
    } else {
      navigate("/admin/login");
    }
  }, [dispatch, page, search, adminInfo, navigate]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
      dispatch(reset());
    }
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
              src={getImageUrl(user.profileImage, "/images/default-avatar.jpg")}
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
            } else {
              dispatch(blockUser(user._id));
            }
          }}
          disabled={usersState.isLoading}
          className={`px-3 py-1 rounded-md text-white ${
            user.isBlocked
              ? "bg-green-500 hover:bg-green-600"
              : "bg-red-500 hover:bg-red-600"
          } ${usersState.isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {usersState.isLoading
            ? "Processing..."
            : user.isBlocked
            ? "Unblock"
            : "Block"}
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
      tableHeaders={["User", "Name", "Email", "Joined", "Status", "Action"]}
      tableData={users}
      renderRow={renderRow}
      isLoading={isLoading}
      isError={isError}
      errorMessage={message}
      pagination={<Pagination currentPage={page} totalPages={Math.ceil(total / 10)} onPageChange={setPage} />}
    />
  );
};

export default UsersPage;
