import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const NavbarMenu = [
  { id: 1, title: "Home", link: "/" },
  { id: 2, title: "About", link: "/AboutUs" },
  { id: 3, title: "Contact", link: "/ContactUs" },
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 flex justify-between items-center py-4"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
            V
          </div>
          <span className="text-xl font-bold text-slate-900">Valley <span className="text-rose-500">360</span></span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-1">
            {NavbarMenu.map((menu) => (
              <li key={menu.id}>
                <Link
                  to={menu.link}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === menu.link
                      ? 'bg-rose-50 text-rose-600'
                      : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  {menu.title}
                </Link>
              </li>
            ))}
          </ul>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/Login"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-rose-600 transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/SignUp"
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-rose-500 to-orange-500 rounded-lg hover:from-rose-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {NavbarMenu.map((menu) => (
                <Link
                  key={menu.id}
                  to={menu.link}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium ${
                    location.pathname === menu.link
                      ? 'bg-rose-50 text-rose-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {menu.title}
                </Link>
              ))}
              <hr className="my-2 border-slate-100" />
              <Link
                to="/Login"
                className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log In
              </Link>
              <Link
                to="/SignUp"
                className="block px-4 py-3 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-rose-500 to-orange-500 text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
