import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const UserProtectedRoute = ({ children }) => {
  const { userInfo } = useSelector((state) => state.userAuth);

  return userInfo ? children : <Navigate to="/login" replace />;
};

export default UserProtectedRoute;
