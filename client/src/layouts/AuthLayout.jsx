import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AuthLayout = () => {
  const { userInfo } = useSelector((state) => state.userAuth);

  // Redirect to home if already logged in
  if (userInfo) {
    return <Navigate to="/" replace />;
  }

  return (
   
      <div >
        <Outlet/>
      </div>

  );
};

export default AuthLayout; 