import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiAward, FiUsers, FiTruck, FiShield } from 'react-icons/fi';
import { FaFutbol, FaBasketballBall, FaRunning, FaVolleyballBall } from 'react-icons/fa';

const AboutUs = () => {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="bg-white text-black overflow-hidden">
      {/* Hero Section with Sports Background */}
      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image - Football Stadium */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1556056504-5c7696c4c28d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2076&q=80" 
            alt="Football Stadium" 
            className="w-full h-full object-cover object-center brightness-[0.85]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
              OUR STORY
            </h1>
            <div className="h-1 w-20 bg-white mx-auto mb-6"></div>
            <p className="text-xl md:text-2xl font-light tracking-wide mb-8">
              Dedicated to athletes everywhere, we deliver innovation and inspiration to push boundaries.
            </p>
          </motion.div>
        </div>

        {/* Animated Sports Icons */}
        <div className="absolute bottom-10 left-0 w-full">
          <div className="flex justify-center space-x-8 md:space-x-16">
            {[FaFutbol, FaBasketballBall, FaRunning, FaVolleyballBall].map((Icon, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.2, duration: 0.5 }}
                className="text-white text-3xl md:text-4xl opacity-80"
              >
                <Icon />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-3">
              OUR MISSION
            </h2>
            <div className="h-1 w-16 bg-black mx-auto mb-6"></div>
            <p className="text-lg text-gray-700 leading-relaxed">
              At Zekoya, we're committed to bringing the best sports gear to athletes of all levels. 
              We believe that quality equipment is essential for performance, safety, and enjoyment of any sport.
            </p>
          </motion.div>

          {/* Values Grid */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { icon: FiAward, title: "QUALITY", description: "Premium materials and craftsmanship in every product" },
              { icon: FiUsers, title: "COMMUNITY", description: "Supporting athletes and teams at all levels" },
              { icon: FiTruck, title: "SERVICE", description: "Fast delivery and exceptional customer support" },
              { icon: FiShield, title: "INTEGRITY", description: "Honest pricing and sustainable business practices" }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="bg-gray-50 p-8 flex flex-col items-center text-center"
              >
                <item.icon className="text-4xl mb-4" />
                <h3 className="text-xl font-bold uppercase tracking-wider mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Story Section with Image */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1"
            >
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-black"></div>
                <img 
                  src="https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Team working" 
                  className="w-full h-auto relative z-10"
                />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-black"></div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6">
                OUR STORY
                <span className="block h-1 w-16 bg-black mt-3"></span>
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Founded in 2020, Zekoya began with a simple vision: to provide athletes with gear that enhances their performance without compromising on style or comfort.
                </p>
                <p>
                  What started as a small local shop has grown into a trusted online destination for sports enthusiasts around the world. Our team of experts carefully selects each product in our catalog, ensuring that it meets our high standards for quality and performance.
                </p>
                <p>
                  Today, we continue to expand our offerings while staying true to our core values of quality, integrity, and exceptional service.
                </p>
              </div>
              <Link 
                to="/products" 
                className="inline-flex items-center gap-2 bg-black text-white px-5 py-3 font-bold text-sm uppercase tracking-wider mt-8 transition-all duration-300 hover:bg-gray-900 group"
              >
                <span>Shop Now</span>
                <FiArrowRight className="transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-3">
              OUR TEAM
            </h2>
            <div className="h-1 w-16 bg-black mx-auto mb-6"></div>
            <p className="text-lg text-gray-700">
              Meet the passionate individuals behind Zekoya who are dedicated to bringing you the best in sports equipment.
            </p>
          </motion.div>

          {/* Team Grid */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { name: "Alex Johnson", role: "Founder & CEO", image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" },
              { name: "Sarah Williams", role: "Head of Product", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1961&q=80" },
              { name: "Michael Chen", role: "Lead Designer", image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2048&q=80" },
              { name: "Emma Rodriguez", role: "Customer Experience", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1976&q=80" }
            ].map((member, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="text-center"
              >
                <div className="relative mb-4 overflow-hidden group">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full aspect-square object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                </div>
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-gray-600 uppercase text-sm tracking-wider">{member.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6">
              JOIN OUR TEAM
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              We're always looking for passionate individuals to join our growing team. 
              Check out our current openings or send us your resume.
            </p>
            <Link 
              to="/contact" 
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:bg-gray-100 group"
            >
              <span>Get In Touch</span>
              <FiArrowRight className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
