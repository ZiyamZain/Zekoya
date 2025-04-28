import React from "react";
import Sidebar from "../components/admin/Sidebar";
import { Outlet } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const AdminLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Header Section */}
        <header className="flex items-center justify-between px-6 py-4 bg-gray-800 text-white shadow-md">
          <h1 className="text-xl font-bold tracking-wide">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FaUserCircle className="text-2xl text-gray-400" />
              <span className="text-sm font-medium">Admin</span>
            </div>
          </div>
        </header>
        {/* Main Content */}
        <main className="flex-1 bg-gray-50 min-h-screen p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
