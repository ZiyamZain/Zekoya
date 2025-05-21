import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';
import Featured from './Featured';
import WhyChooseUs from './WhyChooseUs';
import CustomJerseys from './CustomJerseys';
import PromoBanner from './PromoBanner';
import Categories from './Categories';

const Hero = () => {
  return (
    <div className="relative">
      {/* Main Hero Section */}
      <div className="min-h-[80vh] flex flex-col">
        {/* Main Content */}
        <div className="w-full relative">
          {/* Hero Image */}
          <div className="w-full">
            <img 
              src="/assets/hero/hero-img.jpeg" 
              alt="The Dream" 
              className="w-full h-auto object-cover"
            />
          </div>
          
          {/* Swipe Down Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
            <div className="flex flex-col items-center ">
              <span className="text-white text-sm font-light tracking-widest mb-[100px]">SWIPE DOWN</span>
              <FiChevronDown className="text-white w-6 h-6 mb-[100px]" />
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="bg-white text-center py-20">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter">
            THE DREAM IS REAL
          </h1>
          <p className="mt-4 text-lg">
            Experience the next generation of sports jerseys.
          </p>
          <div className="mt-6 space-x-4">
            <Link 
              to="/products" 
              className="inline-block bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors"
            >
              Shop Now
            </Link>
            <Link 
              to="/about-us" 
              className="inline-block bg-white text-black border-2 border-black px-8 py-3 rounded-full hover:bg-gray-100 transition-colors"
            >
              About Us
            </Link>
          </div>
        </div>

        {/* Decorative Line */}
        <div className="container mx-auto py-[30px] px-8 mb-5">
          <div className="h-[6px] bg-black rounded-full mx-4 md:mx-8 shadow-lg"></div>
        </div>
      </div>
      <Featured />

      <Categories />
      <CustomJerseys />
      <WhyChooseUs />
      <PromoBanner />
    </div>
  );
};

export default Hero;
