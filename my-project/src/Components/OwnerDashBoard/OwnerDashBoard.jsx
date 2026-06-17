import { useEffect, useRef, useState } from 'react';
import api from '/src/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { LuCalendarDays, LuCircleDollarSign, LuClock3, LuEye, LuHistory, LuCar, LuUsers } from 'react-icons/lu';
import Footer from '../Footer/Footer';
import { FadeRight, FadeUp } from '../../utility/annimation';
import { useNavigate  } from 'react-router-dom';

const OwnerDashboard = () => {
  const [todaysBookings, setTodaysBookings] = useState([]);
  const [previousBookings, setPreviousBookings] = useState([]);
  const [owner, setOwner] = useState(null);
  const [showPreviousBookings, setShowPreviousBookings] = useState(false);
  const todayRef = useRef(null);
  const previousRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedOwner = sessionStorage.getItem('user');

    if (storedOwner) {
      const parsedOwner = JSON.parse(storedOwner);
      setOwner(parsedOwner);

      fetchTodaysBookings(parsedOwner.id);
      fetchPreviousBookings(parsedOwner.id); // ✅ ADD THIS
    }
  }, []);

  useEffect(() => {
  if (showPreviousBookings && previousRef.current) {
    previousRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
}, [showPreviousBookings]);

  const fetchTodaysBookings = async (ownerId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('User is not authenticated. Please log in.');
        return;
      }
      const response = await api.get(`http://localhost:8080/booking/today/${ownerId}`);
      setTodaysBookings(response.data);
    } catch (error) {
      
      console.error('Error fetching today\'s bookings:', error);
    }
  };

  const fetchPreviousBookings = async (ownerId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('User is not authenticated. Please log in.');
        return;
      }
      const response = await api.get(`http://localhost:8080/booking/previous/${ownerId}`);
      setPreviousBookings(response.data);
    } catch (error) {
      toast.error('Error fetching previous bookings');
      console.error('Error fetching previous bookings:', error);
    }
  };

  const handleViewPreviousBookings = () => {
    setShowPreviousBookings(!showPreviousBookings); // Toggle previous bookings view
    if (!showPreviousBookings && owner) {
      fetchPreviousBookings(owner.id); // Fetch previous bookings if not already shown
    }
  };

  const scrollToToday = () => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    };

  const scrollToPrevious = () => {
    if (!showPreviousBookings) {
      setShowPreviousBookings(true);

      if (owner) {
        fetchPreviousBookings(owner.id);
      }
    } else {
      if (previousRef.current) {
        previousRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  };

  const todaysRevenue = todaysBookings.reduce((sum, booking) => {
    const amount = Number(booking.price || 0);
    return sum + (Number.isNaN(amount) ? 0 : amount);
  }, 0);

  const stats = [
    {
      label: "Today's bookings",
      value: todaysBookings.length,
      icon: LuCalendarDays,
    },
    {
      label: 'Previous bookings',
      value: previousBookings.length,
      icon: LuHistory,
    },
    {
      label: "Today's revenue",
      value: `Rs. ${todaysRevenue.toFixed(2)}`,
      icon: LuCircleDollarSign,
    },
    {
      label: 'Owner ID',
      value: owner?.id ?? 'N/A',
      icon: LuUsers,
    },
  ];

  const bookingCard = (booking, index, section) => (
    <motion.article
      key={`${section}-${booking.id}-${index}`}
      variants={FadeUp(0.15 + index * 0.05)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-3"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          Booking #{booking.id}
        </span>
        <span className="text-sm text-slate-500">{booking.status}</span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{booking.paymentStatus || 'PENDING_PAYMENT'}</span>
        {booking.paymentUtrNumber && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">UTR: {booking.paymentUtrNumber}</span>
        )}
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <p><span className="text-slate-500">Booking Time:</span> {booking.bookingDate}</p>
        <p><span className="text-slate-500">Departure Date:</span> {booking.depatureDate}</p>
        <p><span className="text-slate-500">Vehicle No:</span> {booking.vehicleNo}</p>
        <p><span className="text-slate-500">Vehicle Type:</span> {booking.vehicleType}</p>
        <p><span className="text-slate-500">Parking Hours:</span> {booking.parkingHours}</p>
        <p><span className="text-slate-500">Price:</span> Rs. {booking.price}</p>
        <p><span className="text-slate-500">Slot ID:</span> {booking.parking_slot_id}</p>
        <p><span className="text-slate-500">Customer ID:</span> {booking.customer_id}</p>
      </div>
    </motion.article>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-100 to-amber-200 text-slate-800 overflow-x-hidden">

      <section className="py-10 sm:py-16">
        <div className="container mx-auto max-w-[1200px] px-6 lg:px-8">
          <motion.div
            variants={FadeRight(0.2)}
            initial="hidden"
            animate="visible"
            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Welcome back, manage bookings with clarity.</h1>
                <p className="max-w-2xl text-slate-600">
                  Keep track of today's bookings, review history, and handle owner actions from one consistent dashboard.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                  <LuCar className="text-xl" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Logged in owner</p>
                  <p className="text-base font-semibold text-slate-900">{owner?.name || owner?.email || 'Owner account'}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <ToastContainer position="top-center" />

          <section className="mt-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <LuCircleDollarSign className="text-xl" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Overview</h2>
                <p className="text-slate-600">A quick summary of booking performance.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;

                return (
                  <motion.div
                    key={stat.label}
                    variants={FadeUp(0.2 + index * 0.08)}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="rounded-xl bg-primary/10 p-3 text-primary">
                        <Icon className="text-xl" />
                      </div>
                    </div>
                    <p className="mt-4 text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </section>

          <section className="mt-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <LuClock3 className="text-xl" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Quick Actions</h2>
                <p className="text-slate-600">Use these shortcuts to manage your parking inventory and history.</p>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-4">
              <button
                className="border border-slate-200 bg-white px-6 py-3 rounded-xl font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
                onClick={scrollToToday}
              >
                Today's Booking
              </button>
              <button
                className="border border-slate-200 bg-white px-6 py-3 rounded-xl font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
                onClick={scrollToPrevious}
              >
                Previous Booking
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
                <p className="text-xl font-bold text-slate-900">Add Parking Area</p>
                <p className="text-slate-600">Create new parking areas and expand available inventory.</p>
                <button className="primary-btn" onClick={() => navigate('/AddParkingArea')}>Go to Add Area</button>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
                <p className="text-xl font-bold text-slate-900">Update Profile</p>
                <p className="text-slate-600">Keep your contact details and account settings up to date.</p>
                <button
                  className="border border-slate-200 bg-white px-6 py-3 rounded-xl font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
                  onClick={() => navigate('/Update')}
                >
                  Update Profile
                </button>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
                <p className="text-xl font-bold text-slate-900">Payment Settings</p>
                <p className="text-slate-600">Configure the UPI ID and display name customers will see at checkout.</p>
                <button
                  className="border border-slate-200 bg-white px-6 py-3 rounded-xl font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
                  onClick={() => navigate('/owner/payment-settings')}
                >
                  Open Settings
                </button>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
                <p className="text-xl font-bold text-slate-900">Payment Reviews</p>
                <p className="text-slate-600">Verify customer payment proofs before the booking is confirmed.</p>
                <button
                  className="border border-slate-200 bg-white px-6 py-3 rounded-xl font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
                  onClick={() => navigate('/owner/payment-review')}
                >
                  Review Payments
                </button>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
                <p className="text-xl font-bold text-slate-900">Previous Bookings</p>
                <p className="text-slate-600">Review booking history and monitor completed reservations.</p>
                <button
                  className="border border-slate-200 bg-white px-6 py-3 rounded-xl font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
                  onClick={handleViewPreviousBookings}
                >
                  {showPreviousBookings ? 'Hide History' : 'View History'}
                </button>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <LuEye className="text-xl" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Recent Activity / Data</h2>
                <p className="text-slate-600">Today's bookings and previous activity, organized in consistent cards.</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
              <div ref={todayRef}>
                <h3 className="text-2xl font-bold text-slate-900">Today's Bookings</h3>
                <p className="mt-2 text-slate-600">Latest reservations made for the current day.</p>

                {todaysBookings.length > 0 ? (
                  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {todaysBookings.map((booking, index) => bookingCard(booking, index, 'today'))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6">
                    <p className="text-slate-600">No bookings found for today.</p>
                  </div>
                )}
              </div>

              <div ref={previousRef} className="mt-10">
                <h3 className="text-2xl font-bold text-slate-900">Previous Bookings</h3>
                <p className="mt-2 text-slate-600">Historical booking records from earlier dates.</p>

                {!showPreviousBookings ? (
                  <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6">
                    <p className="text-slate-600">Click "View History" or "Previous Booking" to load previous bookings.</p>
                  </div>
                ) : previousBookings.length > 0 ? (
                  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {previousBookings.map((booking, index) => bookingCard(booking, index, 'previous'))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6">
                    <p className="text-slate-600">No previous bookings found.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default OwnerDashboard;

