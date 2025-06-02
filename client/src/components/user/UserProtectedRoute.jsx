import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { userAxios } from "../../utils/userAxiosConfig";
import { refreshUserToken, userLogout } from "../../features/userAuth/userAuthSlice";
import { toast } from "react-toastify";

const UserProtectedRoute = ({ children }) => {
  const { userInfo } = useSelector((state) => state.userAuth);
  const dispatch = useDispatch();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      if (!userInfo) {
        setIsVerifying(false);
        return;
      }

      try {
        // Check authentication status using the token
        // The userAxios instance will handle token refresh automatically if needed
        const response = await userAxios.get("/check-auth");
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Authentication verification failed:", error);
        
        // If the error is related to token issues and we have a refresh token
        if (error.response?.status === 401 && userInfo?.refreshToken) {
          try {
            // Try to refresh the token manually
            await dispatch(refreshUserToken()).unwrap();
            setIsAuthenticated(true);
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            // If refresh fails, log the user out
            dispatch(userLogout());
            toast.error("Your session has expired. Please log in again.");
          }
        } else if (error.response?.status === 403) {
          // User is blocked
          toast.error("Your account has been blocked. Please contact support.");
          dispatch(userLogout());
        } else {
          // Other errors
          dispatch(userLogout());
        }
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAuth();
  }, [userInfo, dispatch]);

  if (isVerifying) {
    // You could return a loading spinner here
    return <div className="flex justify-center items-center h-screen">Verifying authentication...</div>;
  }

  if (!userInfo || !isAuthenticated) {
    // Redirect to login and save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default UserProtectedRoute;
