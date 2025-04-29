import React from "react";
import {
  FaFutbol,
  FaSignOutAlt,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { adminLogout } from "../../features/adminAuth/authSlice";
import SidebarMenu from "./SidebarMenu";
import menuConfig from "../../config/menuConfig";

const Sidebar = () => {
  const dispatch = useDispatch();

  const handleClick = () => {
    console.log("Logout clicked");
    dispatch(adminLogout());
  };

  return (
    <aside className="h-screen w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col justify-between border-r border-gray-700 shadow-xl">
      <div className="p-6 border-b border-gray-700 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-2">
            <FaFutbol className="text-2xl text-red-500" />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-400 tracking-wider">
              ZEKOYA
            </h1>
          </div>
          <div className="w-16 h-1 bg-gradient-to-r from-red-500 to-orange-400 mt-2 rounded-full"></div>
          <p className="text-xs text-gray-400 mt-1 tracking-wider">
            ADMIN PANEL
          </p>
        </div>
      </div>


      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
        <SidebarMenu links={menuConfig} />
      </div>


      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleClick}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-gray-300 hover:text-white transition-all duration-200 shadow-md group"
        >
          <FaSignOutAlt className="text-lg text-gray-400 group-hover:text-red-400" />
          <span className="font-medium tracking-wide">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
