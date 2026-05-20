import React, { useEffect, useState } from 'react';
import api from '/src/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const badgeClassMap = {
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

const PaymentReviewPanel = ({ title, description, fetchUrl, emptyMessage = 'No payment submissions found.' }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState({});
  const [proofUrls, setProofUrls] = useState({});
  const [loadingProofId, setLoadingProofId] = useState(null);
  const [actingId, setActingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get(fetchUrl);
      setBookings(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to load payment submissions.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [fetchUrl]);

  const loadProof = async (bookingId) => {
    setLoadingProofId(bookingId);
    try {
      const response = await api.get(`/booking/${bookingId}/payment-proof`, { responseType: 'blob' });
      const objectUrl = URL.createObjectURL(response.data);
      setProofUrls((current) => {
        const existingUrl = current[bookingId];
        if (existingUrl) {
          URL.revokeObjectURL(existingUrl);
        }
        return {
          ...current,
          [bookingId]: objectUrl,
        };
      });
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to load payment proof.';
      toast.error(message);
    } finally {
      setLoadingProofId(null);
    }
  };

  const handleAction = async (bookingId, decision) => {
    setActingId(bookingId);
    try {
      const note = notes[bookingId] || '';
      const endpoint = decision === 'approve' ? 'payment-verify' : 'payment-reject';
      await api.post(`/booking/${bookingId}/${endpoint}`, {
        decision: decision === 'approve' ? 'VERIFY' : 'REJECT',
        note,
      });
      toast.success(decision === 'approve' ? 'Payment approved.' : 'Payment rejected.');
      setNotes((current) => ({ ...current, [bookingId]: '' }));
      await fetchBookings();
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to update payment status.';
      toast.error(message);
    } finally {
      setActingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-100 to-amber-200 px-4 py-8 text-slate-800">
      <ToastContainer position="top-center" />
      <div className="mx-auto w-full max-w-7xl rounded-3xl border border-rose-100 bg-white/85 p-6 shadow-md backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
            <p className="mt-2 max-w-3xl text-slate-600">{description}</p>
          </div>
        </div>

        {loading && (
          <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 text-slate-600 shadow-sm">
            Loading payment submissions...
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 text-slate-600 shadow-sm">
            {emptyMessage}
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
            {bookings.map((booking) => {
              const status = String(booking.paymentStatus || 'PENDING_PAYMENT').toUpperCase();
              const badgeClass = badgeClassMap[status] || 'bg-slate-100 text-slate-700';
              const proofUrl = proofUrls[booking.id];

              return (
                <article key={booking.id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        Booking #{booking.id}
                      </span>
                      <h3 className="mt-3 text-xl font-bold text-slate-900">
                        {booking.parkingAreaName || 'Parking Area'}
                      </h3>
                      <p className="text-sm text-slate-500">Slot #{booking.slotNumber ?? booking.parking_slot_id ?? 'N/A'}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                      {status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <p><span className="font-semibold text-slate-700">Customer:</span> {booking.customer_id ?? 'N/A'}</p>
                    <p><span className="font-semibold text-slate-700">Amount:</span> Rs. {Number(booking.totalPrice ?? booking.price ?? 0).toFixed(2)}</p>
                    <p><span className="font-semibold text-slate-700">UTR:</span> {booking.paymentUtrNumber || 'N/A'}</p>
                    <p><span className="font-semibold text-slate-700">Submitted:</span> {formatDateTime(booking.paymentSubmittedAt)}</p>
                    <p><span className="font-semibold text-slate-700">Verified:</span> {formatDateTime(booking.paymentVerifiedAt)}</p>
                    <p><span className="font-semibold text-slate-700">Expires:</span> {formatDateTime(booking.paymentExpiresAt)}</p>
                  </div>

                  {booking.paymentVerificationNote && (
                    <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
                      <span className="font-semibold text-slate-700">Note:</span> {booking.paymentVerificationNote}
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => loadProof(booking.id)}
                      disabled={loadingProofId === booking.id}
                      className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loadingProofId === booking.id ? 'Loading Proof...' : 'View Proof'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(booking.id, 'approve')}
                      disabled={actingId === booking.id}
                      className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actingId === booking.id ? 'Saving...' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(booking.id, 'reject')}
                      disabled={actingId === booking.id}
                      className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>

                  <label className="mt-5 block text-sm font-medium text-slate-700" htmlFor={`note-${booking.id}`}>
                    Verification note
                  </label>
                  <textarea
                    id={`note-${booking.id}`}
                    rows="3"
                    value={notes[booking.id] || ''}
                    onChange={(e) => setNotes((current) => ({ ...current, [booking.id]: e.target.value }))}
                    placeholder="Optional review note for the customer"
                    className="mt-2 w-full rounded-xl border border-rose-200 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-rose-400"
                  />

                  {proofUrl && (
                    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                      <img src={proofUrl} alt={`Payment proof for booking ${booking.id}`} className="max-h-[360px] w-full object-contain" />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default PaymentReviewPanel;
