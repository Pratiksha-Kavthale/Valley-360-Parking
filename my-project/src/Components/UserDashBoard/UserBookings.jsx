import React, { useEffect, useMemo, useState } from 'react';
import api from '/src/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import NavbarUser from './NavbarUser';
import Footer from '../Footer/Footer';
import ReviewModal from './ReviewModal';

const statusStyle = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  RESERVED: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  EXPIRED: 'bg-rose-100 text-rose-700',
  CANCELLED: 'bg-slate-200 text-slate-700',
};

const paymentStatusStyle = {
  PENDING_PAYMENT: 'bg-amber-100 text-amber-700',
  PAYMENT_SUBMITTED: 'bg-blue-100 text-blue-700',
  PAYMENT_VERIFIED: 'bg-emerald-100 text-emerald-700',
  PAYMENT_REJECTED: 'bg-rose-100 text-rose-700',
  BOOKING_CONFIRMED: 'bg-emerald-100 text-emerald-700',
  BOOKING_CANCELLED: 'bg-slate-200 text-slate-700',
};

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const UserBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [additionalHours, setAdditionalHours] = useState('1');
  const [extending, setExtending] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);

  const user = useMemo(() => {
    const storedUser = sessionStorage.getItem('user');
    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch (e) {
      return null;
    }
  }, []);

  const fetchBookings = async () => {
    if (!user?.id) {
      setError('User session not found. Please login again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/booking/user/${user.id}`);
      setBookings(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to fetch user bookings.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const openExtendModal = (booking) => {
    if (String(booking.status).toUpperCase() !== 'ACTIVE' || String(booking.paymentStatus || '').toUpperCase() !== 'BOOKING_CONFIRMED') {
      toast.error('Only confirmed active bookings can be extended.');
      return;
    }

    setSelectedBooking(booking);
    setAdditionalHours('1');
  };

  const closeModal = () => {
    setSelectedBooking(null);
    setAdditionalHours('1');
  };

  const submitExtension = async () => {
    const parsedHours = Number(additionalHours);
    if (!Number.isInteger(parsedHours) || parsedHours <= 0) {
      toast.error('Additional hours must be a positive integer.');
      return;
    }

    if (!selectedBooking?.id) return;

    try {
      setExtending(true);
      await api.put(`/booking/extend/${selectedBooking.id}`, {
        additionalHours: parsedHours,
      });

      toast.success('Booking extended successfully.');
      closeModal();
      await fetchBookings();
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to extend booking.';
      toast.error(message);
    } finally {
      setExtending(false);
    }
  };

  const openReviewModal = (booking) => {
    const normalizedStatus = String(booking.status || '').toUpperCase();
    if (normalizedStatus !== 'COMPLETED' || String(booking.paymentStatus || '').toUpperCase() !== 'BOOKING_CONFIRMED') {
      toast.error('Review is available only for confirmed completed bookings.');
      return;
    }
    if (booking.hasReview) {
      toast.info('Review already submitted for this booking.');
      return;
    }
    setReviewBooking(booking);
  };

  const closeReviewModal = () => {
    setReviewBooking(null);
  };

  const handleReviewSuccess = async () => {
    closeReviewModal();
    await fetchBookings();
  };

  return (
    <main className="min-h-screen bg-slate-50 overflow-x-hidden">
      <NavbarUser />

      <section className="py-8">
        <div className="container mx-auto max-w-[1200px] px-4 lg:px-8">
          {/* Header */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-rose-100 p-2.5 text-rose-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
                <p className="text-slate-600">View and manage your parking reservations</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/UserDashBoard')}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
            >
              Back to Dashboard
            </button>
          </div>

          <ToastContainer position="top-center" />

          {loading && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center">
              <svg className="animate-spin w-8 h-8 text-rose-500 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-3 text-slate-600">Loading bookings...</p>
            </div>
          )}

          {!loading && error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {!loading && !error && bookings.length === 0 && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-slate-900 font-medium">No bookings found</p>
              <p className="text-slate-500 text-sm mt-1">Start by booking a parking slot</p>
              <button
                onClick={() => navigate('/UserDashBoard')}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-lg font-medium hover:from-rose-600 hover:to-orange-600 transition-all"
              >
                Find Parking
              </button>
            </div>
          )}

          {!loading && !error && bookings.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {bookings.map((booking) => {
                const normalizedStatus = String(booking.status || '').toUpperCase();
                const normalizedPaymentStatus = String(booking.paymentStatus || 'PENDING_PAYMENT').toUpperCase();
                const badgeClass = statusStyle[normalizedStatus] || 'bg-slate-100 text-slate-700';
                const paymentBadgeClass = paymentStatusStyle[normalizedPaymentStatus] || 'bg-slate-100 text-slate-700';
                const canPay = normalizedPaymentStatus === 'PENDING_PAYMENT' || normalizedPaymentStatus === 'PAYMENT_REJECTED';

                return (
                  <article
                    key={booking.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-rose-50 p-2.5 text-rose-500">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {booking.parkingAreaName || 'Parking Area'}
                          </h3>
                          <p className="text-sm text-slate-500">Slot #{booking.slotNumber ?? booking.parking_slot_id ?? 'N/A'}</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass}`}>
                        {booking.status || 'UNKNOWN'}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-slate-500 text-xs">Start Time</p>
                        <p className="font-medium text-slate-900 mt-0.5">{formatDateTime(booking.startTime || booking.arrivalDate)}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-slate-500 text-xs">End Time</p>
                        <p className="font-medium text-slate-900 mt-0.5">{formatDateTime(booking.endTime || booking.departureDate)}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Total Price</p>
                        <p className="text-lg font-bold text-slate-900">Rs. {Number(booking.totalPrice ?? booking.price ?? 0).toFixed(2)}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${paymentBadgeClass}`}>
                        {normalizedPaymentStatus.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openExtendModal(booking)}
                        className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:from-rose-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={normalizedStatus !== 'ACTIVE' || normalizedPaymentStatus !== 'BOOKING_CONFIRMED'}
                      >
                        Extend
                      </button>
                      <button
                        type="button"
                        onClick={() => openReviewModal(booking)}
                        className="px-3 py-1.5 border border-rose-200 bg-rose-50 text-rose-700 rounded-lg text-sm font-medium hover:bg-rose-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={normalizedStatus !== 'COMPLETED' || normalizedPaymentStatus !== 'BOOKING_CONFIRMED' || Boolean(booking.hasReview)}
                      >
                        {booking.hasReview ? 'Reviewed' : 'Review'}
                      </button>
                      {canPay && (
                        <button
                          type="button"
                          onClick={() => navigate(`/BookingPayment/${booking.id}`, { state: { booking } })}
                          className="px-3 py-1.5 border border-amber-200 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
                        >
                          Pay Now
                        </button>
                      )}
                      {normalizedPaymentStatus === 'BOOKING_CONFIRMED' && (
                        <button
                          type="button"
                          onClick={() => navigate('/BookingQR', { state: { booking } })}
                          className="px-3 py-1.5 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                        >
                          View QR
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900">Extend Booking</h2>
            <p className="mt-2 text-sm text-slate-600">
              Enter additional hours for booking #{selectedBooking.id}
            </p>

            <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="additionalHours">
              Additional Hours
            </label>
            <input
              id="additionalHours"
              type="number"
              min="1"
              step="1"
              value={additionalHours}
              onChange={(e) => setAdditionalHours(e.target.value)}
              className="mt-2 w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                disabled={extending}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitExtension}
                className="px-4 py-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-medium rounded-lg hover:from-rose-600 hover:to-orange-600 disabled:opacity-60"
                disabled={extending}
              >
                {extending ? 'Extending...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={closeReviewModal}
          onSuccess={handleReviewSuccess}
        />
      )}

      <Footer />
    </main>
  );
};

export default UserBookings;
