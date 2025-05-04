import React from "react";

const Button = ({ children, className = "", loading = false, ...props }) => {
  return (
    <button
      className={`flex items-center justify-center gap-2 transition-colors ${className} ${
        loading ? "opacity-75 cursor-not-allowed" : ""
      }`}
      disabled={loading}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
