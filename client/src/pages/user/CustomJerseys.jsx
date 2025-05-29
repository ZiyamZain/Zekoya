import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiEdit, FiCheck, FiAward } from 'react-icons/fi';
import { FaTshirt, FaRulerHorizontal, FaFont } from 'react-icons/fa';

const CustomJerseys = () => {
  const [activeJersey, setActiveJersey] = useState(0);
  
  const jerseyDesigns = [
    { color: 'bg-blue-600', accent: 'bg-white', name: 'Blue Strike' },
    { color: 'bg-red-600', accent: 'bg-white', name: 'Red Victory' },
    { color: 'bg-black', accent: 'bg-yellow-400', name: 'Black Thunder' },
    { color: 'bg-green-600', accent: 'bg-white', name: 'Green Machine' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Features of custom jerseys
  const features = [
    { icon: FaTshirt, title: 'Premium Fabric', description: 'Breathable, moisture-wicking material for maximum comfort' },
    { icon: FaFont, title: 'Custom Name & Number', description: 'Add your name and favorite number to make it yours' },
    { icon: FaRulerHorizontal, title: 'Perfect Fit', description: 'Available in all sizes from XS to 3XL' },
    { icon: FiAward, title: 'Quality Guaranteed', description: '100% satisfaction or your money back' },
  ];

  

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Premium black background */}
      <div className="absolute inset-0 bg-black"></div>

      {/* Premium texture overlay */}
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MiIgaGVpZ2h0PSI1MiI+PGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiPjxwYXRoIGQ9Ik0wIDI2aDUyTTI2IDAgMjYgNTIiLz48cGF0aCBkPSJNMCAwaDUydjUySDB6Ii8+PC9nPjwvc3ZnPg==')]"></div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 opacity-70"></div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-[0.03] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-[0.03] rounded-full translate-y-1/2 -translate-x-1/2"></div>

      {/* Content container */}
      <div className="container mx-auto px-4 relative z-10">
        {/* Premium section header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-3">
              <span className="relative inline-block">
                <span className="text-white">CUSTOM JERSEYS</span>
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-white"></span>
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mt-6">
              Elevate your game with personalized jerseys crafted for champions
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-gray-900 shadow-xl rounded-lg p-8 md:p-12 border border-gray-800">
          {/* Left content - Text and features */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-white"
          >
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-3">
              AS YOU SAY, SIR!
              <span className="block h-1 w-20 bg-white mt-3"></span>
            </h2>
            <p className="text-xl mb-8 text-gray-300">
              Stand out on the field with personalized jerseys featuring your
              name and number.
            </p>

            {/* Features grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex items-start space-x-3"
                >
                  <div className="p-2 bg-white rounded-full text-black mt-1">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <Link
              to="/coming-soon"
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider mt-4 transition-all duration-300 hover:bg-gray-200 group shadow-lg"
            >
              <span>Coming soon</span>
              <FiArrowRight className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Right content - Jersey preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Jersey display */}
            <div className="relative h-[500px] flex items-center justify-center">
              {/* Jersey shape */}
              <div
                className={`w-64 h-80 ${jerseyDesigns[activeJersey].color} rounded-t-[160px] relative shadow-2xl`}
              >
                {/* Jersey collar */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-12 bg-white/20 rounded-b-full"></div>

                {/* Jersey stripes */}
                <div
                  className={`absolute top-24 left-0 w-full h-8 ${jerseyDesigns[activeJersey].accent} opacity-30`}
                ></div>

                {/* Jersey number */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-black text-white/90">
                  10
                </div>

                {/* Jersey name */}
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-xl font-bold text-white/90 uppercase tracking-wider">
                  YOUR NAME
                </div>

                {/* Jersey customization tag */}
                <div className="absolute -bottom-4 -right-4 bg-white text-blue-600 rounded-full p-3 shadow-lg">
                  <FiEdit className="w-6 h-6" />
                </div>
              </div>

              {/* 3D effect elements */}
              <div className="absolute top-[140px] left-1/2 transform -translate-x-1/2 w-56 h-[300px] bg-black/10 blur-md -z-10 rounded-[100px]"></div>
            </div>

            {/* Color options */}
            <div className="flex justify-center space-x-4 mt-6">
              {jerseyDesigns.map((design, index) => (
                <motion.button
                  key={index}
                  className={`w-12 h-12 rounded-full ${
                    design.color
                  } flex items-center justify-center border-4 ${
                    activeJersey === index
                      ? "border-white"
                      : "border-transparent"
                  } transition-all duration-300 shadow-md`}
                  onClick={() => setActiveJersey(index)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {activeJersey === index && <FiCheck className="text-white" />}
                </motion.button>
              ))}
            </div>

            {/* Selected jersey name */}
            <div className="text-center mt-4 text-white font-medium">
              {jerseyDesigns[activeJersey].name}
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-white text-xl font-light max-w-2xl mx-auto mb-6">
            Join thousands of satisfied customers who've already created their
            dream jerseys.
          </p>
          <div className="flex justify-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-white opacity-70"></div>
            <div className="w-3 h-3 rounded-full bg-white"></div>
            <div className="w-3 h-3 rounded-full bg-white opacity-70"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CustomJerseys;
