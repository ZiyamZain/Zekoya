import React from "react";
import { NavLink } from "react-router-dom";
import * as Icons from "react-icons/fa";

const SidebarMenu = ({ links }) => {
  return (
    <nav className="space-y-1">
      {links.map((link) => {
        const IconComponent = Icons[link.icon];
        return (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 my-1 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-gradient-to-r from-red-500/20 to-orange-400/20 text-white border-l-4 border-red-500 shadow-lg"
                  : "text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-l-4 hover:border-gray-600"
              }`
            }
          >
            {IconComponent && (
              <span className="text-lg group-hover:text-white">
                <IconComponent />
              </span>
            )}
            <span className="font-medium tracking-wide">{link.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default SidebarMenu;