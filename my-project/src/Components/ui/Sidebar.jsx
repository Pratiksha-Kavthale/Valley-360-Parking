import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  HiOutlineViewGrid,
  HiOutlineLocationMarker,
  HiOutlineUsers,
  HiOutlineUserCircle,
  HiOutlineTrendingUp,
  HiOutlineShieldCheck,
  HiOutlineCreditCard,
  HiOutlineQrcode,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineLogout,
  HiOutlineBell,
  HiOutlineCog,
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlinePlus,
  HiOutlineLogin,
  HiOutlineUserAdd,
  HiOutlineInformationCircle,
  HiOutlineMail,
} from 'react-icons/hi';
import { LuCar } from 'react-icons/lu';

// Admin menu items
const adminMenuItems = [
  { id: 'dashboard', title: 'Dashboard', icon: HiOutlineViewGrid, link: '/Admin' },
  { id: 'parking-areas', title: 'Parking Areas', icon: HiOutlineLocationMarker, link: '/ViewParkingArea' },
  { id: 'parking-slots', title: 'Parking Slots', icon: LuCar, link: '/ViewAllParkingSlots' },
  { id: 'owners', title: 'Owners', icon: HiOutlineUserCircle, link: '/ViewOwners' },
  { id: 'customers', title: 'Customers', icon: HiOutlineUsers, link: '/ViewCustomers' },
  { id: 'risk-monitor', title: 'Risk Monitor', icon: HiOutlineShieldCheck, link: '/admin/owner-risk' },
  { id: 'analytics', title: 'Analytics', icon: HiOutlineTrendingUp, link: '/admin/review-analytics' },
  { id: 'payments', title: 'Payments', icon: HiOutlineCreditCard, link: '/admin/payment-review' },
  { id: 'validate-qr', title: 'Validate QR', icon: HiOutlineQrcode, link: '/ValidateBookingQR' },
];

// User menu items (no Home - already logged in)
const userMenuItems = [
  { id: 'dashboard', title: 'Dashboard', icon: HiOutlineViewGrid, link: '/UserDashBoard' },
  { id: 'bookings', title: 'My Bookings', icon: HiOutlineCalendar, link: '/user/bookings' },
  { id: 'profile', title: 'Profile', icon: HiOutlineUser, link: '/Profile' },
  { id: 'update', title: 'Settings', icon: HiOutlineCog, link: '/Update' },
];

// Owner menu items
const ownerMenuItems = [
  { id: 'dashboard', title: 'Dashboard', icon: HiOutlineViewGrid, link: '/OwnerDashBoard' },
  { id: 'parking-areas', title: 'My Areas', icon: HiOutlineLocationMarker, link: '/owner/parking-areas' },
  { id: 'add-area', title: 'Add Area', icon: HiOutlinePlus, link: '/AddParkingArea' },
  { id: 'analytics', title: 'Analytics', icon: HiOutlineTrendingUp, link: '/owner/review-analytics' },
  { id: 'payments', title: 'Payments', icon: HiOutlineCreditCard, link: '/owner/payment-review' },
  { id: 'settings', title: 'Payment Settings', icon: HiOutlineCog, link: '/owner/payment-settings' },
];

// Public menu items (for non-authenticated users)
const publicMenuItems = [
  { id: 'home', title: 'Home', icon: HiOutlineHome, link: '/' },
  { id: 'about', title: 'About Us', icon: HiOutlineInformationCircle, link: '/AboutUs' },
  { id: 'contact', title: 'Contact', icon: HiOutlineMail, link: '/ContactUs' },
  { id: 'login', title: 'Login', icon: HiOutlineLogin, link: '/Login' },
  { id: 'signup', title: 'Sign Up', icon: HiOutlineUserAdd, link: '/SignUp' },
];

const Sidebar = ({ variant = 'public', user = null }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch notifications (you can replace with real API call)
  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      // TODO: Replace with actual API call
      // const response = await api.get('/notifications');
      // setNotifications(response.data);
      
      // For now, show empty state
      setNotifications([]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (variant !== 'public') {
      fetchNotifications();
    }
  }, [variant]);

  // Select menu items based on variant
  const getMenuItems = () => {
    switch (variant) {
      case 'admin': return adminMenuItems;
      case 'owner': return ownerMenuItems;
      case 'user': return userMenuItems;
      default: return publicMenuItems;
    }
  };
  const menuItems = getMenuItems();

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const isActive = (link) => location.pathname === link;

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-slate-200"
      >
        <LuCar className="w-6 h-6 text-rose-500" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isExpanded ? 280 : 80,
          x: isMobileOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1024 ? -280 : 0),
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className="fixed left-0 top-0 h-screen bg-white/95 backdrop-blur-xl border-r border-slate-200 shadow-xl z-50 flex flex-col"
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-slate-100">
          <motion.div
            initial={false}
            animate={{ justifyContent: isExpanded ? 'flex-start' : 'center' }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200">
              <LuCar className="w-6 h-6 text-white" />
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col"
                >
                  <span className="font-bold text-slate-800 text-lg">Valley 360</span>
                  <span className="text-xs text-slate-500 capitalize">{variant} Panel</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* User Profile Section */}
        {user && (
          <div className="p-4 border-b border-slate-100">
            <motion.div
              initial={false}
              animate={{ justifyContent: isExpanded ? 'flex-start' : 'center' }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.firstName?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col overflow-hidden"
                  >
                    <span className="font-semibold text-slate-800 truncate">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-xs text-slate-500 truncate">{user.email}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 overflow-y-auto scrollbar-thin">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.link);

              return (
                <li key={item.id}>
                  <motion.button
                    onClick={() => navigate(item.link)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                      ${active
                        ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-200'
                        : 'text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    <div
                      className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all
                        ${active ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-rose-100'}`}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-600 group-hover:text-rose-500'}`} />
                    </div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="font-medium whitespace-nowrap"
                        >
                          {item.title}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-slate-100 space-y-1">
          {/* Notifications - only for authenticated users */}
          {variant !== 'public' && (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-all group"
              >
                <div className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 group-hover:bg-amber-100">
                  <HiOutlineBell className="w-5 h-5 text-slate-600 group-hover:text-amber-600" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="font-medium whitespace-nowrap"
                    >
                      Notifications
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Notifications Popup */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute left-full bottom-0 ml-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 bg-gradient-to-r from-rose-500 to-orange-500">
                      <h3 className="text-white font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {loadingNotifications ? (
                        <div className="p-4 text-center">
                          <div className="animate-spin w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full mx-auto" />
                        </div>
                      ) : notifications.length > 0 ? (
                        notifications.map((notif, index) => (
                          <div key={index} className="px-4 py-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                            <p className="text-sm text-slate-800 font-medium">{notif.title}</p>
                            <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                            <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center">
                          <HiOutlineBell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">No notifications yet</p>
                          <p className="text-xs text-slate-400 mt-1">You&apos;re all caught up!</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Logout - only for authenticated users */}
          {variant !== 'public' && (
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all group"
            >
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 group-hover:bg-red-100">
                <HiOutlineLogout className="w-5 h-5" />
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="font-medium whitespace-nowrap"
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}

          {/* Expand Toggle */}
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <div className="w-9 h-9 flex items-center justify-center rounded-lg">
              {isExpanded ? <HiOutlineChevronLeft className="w-5 h-5" /> : <HiOutlineChevronRight className="w-5 h-5" />}
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="font-medium whitespace-nowrap text-sm"
                >
                  Collapse Menu
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
};

Sidebar.propTypes = {
  variant: PropTypes.oneOf(['admin', 'owner', 'user', 'public']),
  user: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
  }),
};

export default Sidebar;
