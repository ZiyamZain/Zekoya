import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { userLogout } from '../../features/userAuth/userAuthSlice';
import userAuthService from '../../features/userAuth/userAuthService';
import { toast } from 'react-toastify';

const BlockedUserChecker = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.userAuth);
  const intervalRef = useRef(null);
  
  // Check interval in milliseconds (e.g., every 2 minutes)
  const CHECK_INTERVAL = 2 * 60 * 1000;
  
  useEffect(() => {
    const checkBlockedStatus = async () => {
      // Only check if user is logged in
      if (userInfo && userInfo.token) {
        try {
          const { isBlocked } = await userAuthService.checkUserStatus();
          
          if (isBlocked) {
            // Clear the interval to prevent further checks
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            
            // Log the user out
            dispatch(userLogout());
            
            // Show a notification
            toast.error(
              'Your account has been blocked. Please contact customer support for assistance.',
              { autoClose: false }
            );
          }
        } catch (error) {
          console.error('Error checking blocked status:', error);
        }
      }
    };
    
    // Check immediately on component mount
    if (userInfo) {
      checkBlockedStatus();
    }
    
    // Set up interval for periodic checks
    intervalRef.current = setInterval(checkBlockedStatus, CHECK_INTERVAL);
    
    // Clean up interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [dispatch, userInfo]);
  
  // This component doesn't render anything
  return null;
};

export default BlockedUserChecker;
