import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import adminAxios from "../../utils/adminAxiosConfig";
import { adminLogout } from "../../features/adminAuth/authSlice";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children }) => {
  const { adminInfo } = useSelector((state) => state.adminAuth);
  const dispatch = useDispatch();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      if (!adminInfo) {
        setIsVerifying(false);
        return;
      }

      try {
        // Check authentication status using the check-auth endpoint
        const response = await adminAxios.get("/check-auth");
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Admin authentication verification failed:", error);
        
        // If the error is related to token issues and we have a refresh token
        if (error.response?.status === 401 && adminInfo?.refreshToken) {
          try {
            // Try to refresh the token manually
            // Token refresh logic removed for simple JWT auth
            setIsAuthenticated(false);
          } catch (refreshError) {
            console.error("Admin token refresh failed:", refreshError);
            // If refresh fails, log the admin out
            dispatch(adminLogout());
            toast.error("Your session has expired. Please log in again.");
          }
        } else {
          // Other errors
          dispatch(adminLogout());
        }
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAuth();
  }, [adminInfo, dispatch]);

  if (isVerifying) {
    // You could return a loading spinner here
    return <div className="flex justify-center items-center h-screen">Verifying authentication...</div>;
  }

  if (!adminInfo || !isAuthenticated) {
    // Redirect to login and save the location they were trying to access
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;