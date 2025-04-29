import React from 'react';
import Featured from './user/Featured';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { userLogout } from '../features/userAuth/userAuthSlice';

const Home = () => {
  const userInfo = useSelector((state) => state.userAuth.userInfo);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(userLogout());
    navigate('/');
  };

  return (
    <main className="relative min-h-screen">

      <div className="absolute top-6 right-8 z-20">
        {userInfo ? (
          <button
            onClick={handleLogout}
            className="border border-black px-5 py-1 rounded bg-white text-black text-sm font-medium hover:bg-black hover:text-white transition-colors duration-200"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="border border-black px-5 py-1 rounded bg-white text-black text-sm font-medium hover:bg-black hover:text-white transition-colors duration-200"
          >
            Login
          </Link>
        )}
      </div>
      <Featured />
      {/* Add other sections here */}
    </main>
  );
};

export default Home; 