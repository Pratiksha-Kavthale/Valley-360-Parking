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
    <main className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-100 to-amber-200 overflow-x-hidden">
      <NavbarUser />

      <section className="py-10 sm:py-16">
        <div className="container mx-auto max-w-[1200px] px-6 lg:px-8">
          <div className="rounded-3xl border border-rose-100 bg-white p-6 shadow-md sm:p-8">
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">My Bookings</h1>
            <p className="mt-2 text-slate-600">View your parking bookings and extend active sessions in real time.</p>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => navigate('/UserDashBoard')}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
              >
                Back to User Dashboard
              </button>
            </div>
          </div>

          <ToastContainer position="top-center" />

          {loading && (
            <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 text-slate-600 shadow-sm">
              Loading bookings...
            </div>
          )}

          {!loading && error && (
            <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
              {error}
            </div>
          )}

          {!loading && !error && bookings.length === 0 && (
            <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 text-slate-600 shadow-sm">
              No bookings found.
            </div>
          )}

          {!loading && !error && bookings.length > 0 && (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              {bookings.map((booking) => {
                const normalizedStatus = String(booking.status || '').toUpperCase();
                const normalizedPaymentStatus = String(booking.paymentStatus || 'PENDING_PAYMENT').toUpperCase();
                const badgeClass = statusStyle[normalizedStatus] || 'bg-slate-100 text-slate-700';
                const paymentBadgeClass = paymentStatusStyle[normalizedPaymentStatus] || 'bg-slate-100 text-slate-700';
                const canPay = normalizedPaymentStatus === 'PENDING_PAYMENT' || normalizedPaymentStatus === 'PAYMENT_REJECTED';

                return (
                  <article
                    key={booking.id}
                    className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {booking.parkingAreaName || 'Parking Area'}
                        </h3>
                        <p className="text-sm text-slate-500">Slot #{booking.slotNumber ?? booking.parking_slot_id ?? 'N/A'}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                        {booking.status || 'UNKNOWN'}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <p>
                        <span className="font-semibold text-slate-700">Start Time:</span> {formatDateTime(booking.startTime || booking.arrivalDate)}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-700">End Time:</span> {formatDateTime(booking.endTime || booking.departureDate)}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-700">Price:</span> Rs. {Number(booking.totalPrice ?? booking.price ?? 0).toFixed(2)}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                      <span className={`rounded-full px-3 py-1 ${badgeClass}`}>{normalizedStatus}</span>
                      <span className={`rounded-full px-3 py-1 ${paymentBadgeClass}`}>{normalizedPaymentStatus}</span>
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openExtendModal(booking)}
                        className="primary-btn disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={normalizedStatus !== 'ACTIVE' || normalizedPaymentStatus !== 'BOOKING_CONFIRMED'}
                      >
                        Extend Time
                      </button>
                      <button
                        type="button"
                        onClick={() => openReviewModal(booking)}
                        className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={normalizedStatus !== 'COMPLETED' || normalizedPaymentStatus !== 'BOOKING_CONFIRMED' || Boolean(booking.hasReview)}
                      >
                        {booking.hasReview ? 'Review Submitted' : 'Leave Review'}
                      </button>
                      {canPay && (
                        <button
                          type="button"
                          onClick={() => navigate(`/BookingPayment/${booking.id}`, { state: { booking } })}
                          className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:border-amber-300 hover:bg-amber-100"
                        >
                          Pay Now
                        </button>
                      )}
                      {normalizedPaymentStatus === 'BOOKING_CONFIRMED' && (
                        <button
                          type="button"
                          onClick={() => navigate('/BookingQR', { state: { booking } })}
                          className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
                        >
                          View Entry QR
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
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900">Extend Booking Time</h2>
            <p className="mt-2 text-sm text-slate-600">
              Enter additional hours for booking #{selectedBooking.id}.
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
              className="mt-2 w-full rounded-md border border-rose-200 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50"
                disabled={extending}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitExtension}
                className="rounded-md bg-rose-500 px-4 py-2 font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
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
