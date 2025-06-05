import React from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {useSelector} from 'react-redux';

const PromoBanner = () => {
    const userInfo = useSelector((state) => state.userAuth.userInfo)
  return (
    <section className="bg-red-600 py-12 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_40%,rgba(0,0,0,0.08)_40%,rgba(0,0,0,0.08)_60%,transparent_60%)] z-0"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-red-500 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-500 rounded-full translate-y-1/2 -translate-x-1/2 opacity-50"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left mb-6 md:mb-0"
          >
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">
              THANKS FOR THE VISIT!
            </h2>
           
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {userInfo ? (
              <Link 
              to="/profile"
              className="inline-flex items-center justify-center bg-black text-white px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:bg-gray-900 relative overflow-hidden group"
            >
              <span className="relative z-10">My Account</span>
              <span className="absolute inset-0 bg-black translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-in-out"></span>
              <span className="absolute right-4">→</span>
            </Link>
              
            ):(
              <Link 
              to="/register" 
              className="inline-flex items-center justify-center bg-black text-white px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:bg-gray-900 relative overflow-hidden group"
            >
              <span className="relative z-10">SIGN UP FOR FREE</span>
              <span className="absolute inset-0 bg-black translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-in-out"></span>
              <span className="absolute right-4">→</span>
            </Link>

            )
          }
            
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
