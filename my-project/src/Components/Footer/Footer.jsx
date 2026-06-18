import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className='bg-slate-900 text-white'>
      <div className='container mx-auto px-4 py-12'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className='grid grid-cols-1 md:grid-cols-4 gap-8'
        >
          {/* Logo & Description */}
          <div className='md:col-span-2'>
            <Link to="/" className='flex items-center gap-2'>
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                V
              </div>
              <span className="text-xl font-bold text-white">Valley 360</span>
            </Link>
            <p className='mt-4 text-slate-400 text-sm leading-relaxed max-w-md'>
              Your smart parking solution. Find, book, and manage parking spots with ease. 
              We're making urban parking simpler, faster, and more convenient.
            </p>
            {/* Social Icons */}
            <div className='flex items-center gap-3 mt-6'>
              {[
                { icon: FaFacebookF, href: '#' },
                { icon: FaTwitter, href: '#' },
                { icon: FaInstagram, href: '#' },
                { icon: FaLinkedinIn, href: '#' },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className='w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-colors'
                >
                  <social.icon className='text-sm' />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4'>Quick Links</h3>
            <ul className='space-y-2'>
              {[
                { label: 'Home', path: '/' },
                { label: 'About Us', path: '/AboutUs' },
                { label: 'Contact', path: '/ContactUs' },
                { label: 'Login', path: '/Login' },
              ].map((link, index) => (
                <li key={index}>
                  <Link to={link.path} className='text-slate-400 hover:text-rose-400 text-sm transition-colors'>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className='text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4'>Contact</h3>
            <ul className='space-y-3 text-sm text-slate-400'>
              <li className='flex items-start gap-2'>
                <svg className='w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                </svg>
                Pune, Maharashtra, India
              </li>
              <li className='flex items-start gap-2'>
                <svg className='w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                </svg>
                support@valley360.com
              </li>
              <li className='flex items-start gap-2'>
                <svg className='w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                </svg>
                +91 98765 43210
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className='border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4'>
          <p className='text-slate-500 text-sm'>
            © 2026 Valley 360 Parking. All rights reserved.
          </p>
          <div className='flex items-center gap-6 text-sm text-slate-500'>
            <a href='#' className='hover:text-rose-400 transition-colors'>Privacy Policy</a>
            <a href='#' className='hover:text-rose-400 transition-colors'>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

