import React, { useEffect } from "react";
import Sidebar from "../components/admin/Sidebar";
import { Outlet } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const AdminLayout = () => {
  useEffect(() => {
    document.title = 'Zekoya Admin Panel';

    // Optional: Reset to default title when the component unmounts
    return () => {
      document.title = 'Zekoya'; // Your default title from index.html
    };
  }, []); // Empty dependency array means this effect runs once when the component mounts
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <div className="fixed inset-y-0 left-0 z-10 w-64">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Fixed Header */}
        <header className="fixed top-0 right-0 left-64 z-10 flex items-center justify-between px-6 py-4 bg-gray-800 text-white shadow-md">
          <h1 className="text-xl font-bold tracking-wide">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FaUserCircle className="text-2xl text-gray-400" />
              <span className="text-sm font-medium">Admin</span>
            </div>
          </div>
        </header>
        
        {/* Scrollable Content */}
        <main className="flex-1 mt-16 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
