import React from "react";
import { NavLink } from "react-router-dom";
import * as Icons from "react-icons/fa";

const SidebarMenu = ({ links }) => {
  return (
    <nav className="space-y-1">
      {links.map((link) => {
        const IconComponent = Icons[link.icon];
        const isCoupons = link.label === "Coupons";
        
        return (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => {
              const baseClasses = "flex items-center justify-between gap-3 px-4 py-3 my-1 rounded-lg text-sm font-medium transition-all duration-300 group relative overflow-hidden";
              
              if (isActive) {
                return isCoupons 
                  ? `${baseClasses} bg-gradient-to-r from-yellow-500/20 to-amber-400/20 text-white border-l-4 border-yellow-500 shadow-lg`
                  : `${baseClasses} bg-gradient-to-r from-red-500/20 to-orange-400/20 text-white border-l-4 border-red-500 shadow-lg`;
              }
              
              return `${baseClasses} text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-l-4 hover:border-gray-600`;
            }}
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  {IconComponent && (
                    <span className={`text-lg group-hover:scale-110 transition-transform duration-300 ${
                      isCoupons 
                        ? isActive 
                          ? "text-yellow-400" 
                          : "text-amber-400 group-hover:text-yellow-400"
                        : ""
                    }`}>
                      <IconComponent />
                    </span>
                  )}
                  <span className="font-medium tracking-wide">{link.label}</span>
                </div>
                
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default SidebarMenu;