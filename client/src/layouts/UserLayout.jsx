import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/user/Navbar.jsx';
import Footer from '../components/user/Footer.jsx';
// import Featured from '../pages/user/Featured';
// import Categories from '../pages/user/Categories';
const UserLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
        <Navbar/> 
    
      <main className="flex-grow">
        <Outlet />
        {/* <Featured/> */}
        {/* <Categories/> */}
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;
