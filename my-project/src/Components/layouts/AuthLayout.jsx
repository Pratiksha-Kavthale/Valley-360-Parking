import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts';

const AuthLayout = ({ children, title, subtitle }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-white font-bold text-xl">
            V
          </div>
          <span className="text-2xl font-bold text-white">Valley 360</span>
        </Link>

        {/* Content */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-4">
            Smart Parking Made Simple
          </h1>
          <p className="text-white/90 text-lg leading-relaxed">
            Find, book, and manage parking spaces effortlessly. 
            Join thousands of users who trust Valley 360 for their parking needs.
          </p>

          {/* Features */}
          <div className="mt-8 space-y-4">
            {[
              'Real-time parking availability',
              'Secure online payments',
              'QR code based entry/exit',
              '24/7 customer support',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-white/70 text-sm">
          © 2024 Valley 360. All rights reserved.
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
              V
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">Valley 360</span>
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 ml-auto"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Title */}
            {(title || subtitle) && (
              <div className="text-center mb-8">
                {title && (
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="mt-2 text-slate-600 dark:text-slate-400">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {/* Form content */}
            {children}
          </div>
        </div>

        {/* Mobile footer */}
        <div className="lg:hidden p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
          © 2024 Valley 360. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
