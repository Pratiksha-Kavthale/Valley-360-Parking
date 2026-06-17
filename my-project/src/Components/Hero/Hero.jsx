import React from 'react';
import { motion } from "framer-motion";
import { Link, useNavigate } from 'react-router-dom';
import ParkingAnimation from './ParkingAnimation';

const Hero = () => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate('/Login');
  };

  return (
    <section className='bg-gradient-to-br from-slate-50 via-white to-rose-50/30 min-h-[calc(100vh-80px)] relative overflow-hidden'>
      {/* Background decorations */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-rose-100 rounded-full blur-3xl opacity-50' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-orange-100 rounded-full blur-3xl opacity-50' />
      </div>

      <div className='container mx-auto px-4 py-12 md:py-20'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          {/* Content */}
          <div className='relative z-10 text-center lg:text-left'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className='inline-flex items-center gap-2 bg-rose-100 text-rose-600 px-4 py-2 rounded-full text-sm font-medium mb-6'
            >
              <span className='w-2 h-2 bg-rose-500 rounded-full animate-pulse' />
              Smart Parking Solution
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className='text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight'
            >
              Find the Perfect
              <br />
              <span className='bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent'>
                Parking Spot
              </span>
              <br />
              Anywhere, Anytime
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='mt-6 text-lg text-slate-600 max-w-xl mx-auto lg:mx-0'
            >
              Discover a new era of parking convenience with Valley 360. 
              Book, pay, and manage your parking spots with just a few clicks.
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className='flex flex-wrap justify-center lg:justify-start gap-6 mt-8'
            >
              {[
                { icon: '🎯', text: 'Find Nearby Spots' },
                { icon: '⚡', text: 'Instant Booking' },
                { icon: '🔒', text: 'Secure Payment' },
              ].map((feature, index) => (
                <div key={index} className='flex items-center gap-2 text-slate-700'>
                  <span className='text-xl'>{feature.icon}</span>
                  <span className='text-sm font-medium'>{feature.text}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className='flex flex-wrap justify-center lg:justify-start gap-4 mt-10'
            >
              <button
                onClick={handleBookNow}
                className='px-8 py-3.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-rose-600 hover:to-orange-600 transition-all flex items-center gap-2'
              >
                <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                </svg>
                Find Parking Now
              </button>
              <Link
                to='/AboutUs'
                className='px-8 py-3.5 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all'
              >
                Learn More
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className='flex justify-center lg:justify-start gap-8 mt-12 pt-8 border-t border-slate-200'
            >
              {[
                { value: '10K+', label: 'Parking Spots' },
                { value: '50+', label: 'Cities' },
                { value: '100K+', label: 'Happy Users' },
              ].map((stat, index) => (
                <div key={index} className='text-center lg:text-left'>
                  <p className='text-2xl font-bold text-slate-900'>{stat.value}</p>
                  <p className='text-sm text-slate-500'>{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='relative hidden lg:flex justify-center items-center'
          >
            <div className='w-full max-w-[500px] aspect-square bg-gradient-to-br from-rose-100 to-orange-100 rounded-full absolute opacity-20 blur-3xl' />
            <div className='relative w-[500px] h-[400px]'>
              <ParkingAnimation />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
