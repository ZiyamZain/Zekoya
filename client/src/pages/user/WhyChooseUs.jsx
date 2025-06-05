import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FiCheckCircle, FiTruck, FiShield, FiAward, FiRefreshCw } from 'react-icons/fi';
import { FaRunning, FaBasketballBall } from 'react-icons/fa';

const WhyChooseUs = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Reasons to choose us
  const reasons = [
    {
      icon: FiAward,
      title: "PREMIUM QUALITY",
      description: "Crafted with the finest materials for durability and performance."
    },
    {
      icon: FiTruck,
      title: "FAST DELIVERY",
      description: "Quick shipping to get your gear to you when you need it."
    },
    {
      icon: FiRefreshCw,
      title: "EASY RETURNS",
      description: "30-day hassle-free return policy for your peace of mind."
    },
    {
      icon: FiShield,
      title: "SECURE SHOPPING",
      description: "Your data is protected with industry-leading encryption."
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-[#f8f8f5] relative overflow-hidden">
      {/* Diagonal stripes background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(135deg,transparent_25%,#000_25%,#000_26%,transparent_26%,transparent_50%,#000_50%,#000_51%,transparent_51%,transparent_75%,#000_75%,#000_76%,transparent_76%)] bg-[length:20px_20px]"></div>
      </div>
      
      {/* Dynamic background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-black to-transparent opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-black to-transparent opacity-5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
      
      {/* Sporty decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-1 bg-black opacity-10 rotate-45"></div>
      <div className="absolute top-14 left-14 w-10 h-1 bg-black opacity-10 rotate-45"></div>
      <div className="absolute bottom-10 right-10 w-20 h-1 bg-black opacity-10 -rotate-45"></div>
      <div className="absolute bottom-14 right-14 w-10 h-1 bg-black opacity-10 -rotate-45"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-3">
            WHY CHOOSE US
          </h2>
          <div className="h-1 w-16 bg-black mx-auto mb-6"></div>
          <p className="text-lg text-gray-700 leading-relaxed">
            At Zekoya, we're committed to excellence in every aspect of our business, from product quality to customer service.
          </p>
        </motion.div>

        {/* Reasons Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {reasons.map((reason, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className="bg-white p-8 flex flex-col items-center text-center group hover:bg-black hover:text-white transition-all duration-300"
            >
              <div className="mb-5 text-4xl group-hover:scale-110 transition-transform duration-300">
                <reason.icon />
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-wider">{reason.title}</h3>
              <p className="text-gray-600 group-hover:text-gray-300">{reason.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Sports Icons */}
        <div className="mt-20 flex justify-center space-x-16 opacity-10">
          {[FaRunning, FaBasketballBall, FiCheckCircle].map((Icon, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 * index, duration: 0.5 }}
              className="text-5xl text-black"
            >
              <Icon />
            </motion.div>
          ))}
        </div>

        {/* Testimonial */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-20 max-w-4xl mx-auto text-center bg-white p-10 relative"
        >
          <div className="absolute -top-4 -left-4 w-16 h-16 border-t-2 border-l-2 border-black"></div>
          <div className="absolute -bottom-4 -right-4 w-16 h-16 border-b-2 border-r-2 border-black"></div>
          
          <p className="text-xl italic mb-6 text-gray-700">
            "The quality and performance of Zekoya's products have transformed my training. I wouldn't trust any other brand for my sporting needs."
          </p>
          <p className="font-bold text-lg">Zinan Muhammed</p>
          <p className="text-sm text-gray-500 uppercase tracking-wider">My Bro</p>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
