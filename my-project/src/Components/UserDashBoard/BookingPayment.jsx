import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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

const BookingPayment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [paymentData, setPaymentData] = useState(null);
  const [booking, setBooking] = useState(state?.booking || null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BOTH');
  const [screenshot, setScreenshot] = useState(null);

  useEffect(() => {
    const loadPaymentQr = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/booking/${bookingId}/payment-qr`);
        setPaymentData(response.data);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Unable to load payment QR.');
      } finally {
        setLoading(false);
      }
    };

    loadPaymentQr();
  }, [bookingId]);

  const paymentStatus = useMemo(() => {
    return String(paymentData?.paymentStatus || booking?.paymentStatus || 'PENDING_PAYMENT').toUpperCase();
  }, [paymentData, booking]);

  const normalizedBooking = booking || {
    id: paymentData?.bookingId || bookingId,
    parkingAreaName: paymentData?.parkingAreaName,
    paymentStatus,
  };

  const handleScreenshotChange = (event) => {
    setScreenshot(event.target.files?.[0] || null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('paymentMethod', paymentMethod);
      if (utrNumber.trim()) {
        formData.append('utrNumber', utrNumber.trim());
      }
      if (screenshot) {
        formData.append('screenshot', screenshot);
      }

      const response = await api.post(`/booking/${bookingId}/payment-submission`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setBooking(response.data);
      toast.success('Payment proof submitted. The owner will review it shortly.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to submit payment proof.');
    } finally {
      setSubmitting(false);
    }
  };

  const openInUpi = () => {
    if (paymentData?.paymentUri) {
      window.location.href = paymentData.paymentUri;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-100 to-amber-200 px-4 py-8 text-slate-800">
      <ToastContainer position="top-center" />
      <div className="mx-auto w-full max-w-5xl rounded-3xl border border-rose-100 bg-white/85 p-6 shadow-md backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-500">Payment Checkout</p>
            <h1 className="text-3xl font-bold text-slate-900">Pay for booking #{normalizedBooking.id}</h1>
            <p className="mt-2 max-w-3xl text-slate-600">Scan the QR or open the UPI app, then submit the payment screenshot or UTR for verification.</p>
          </div>
          <button
            onClick={() => navigate('/user/bookings')}
            className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
          >
            Back to bookings
          </button>
        </div>

        {loading ? (
          <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 text-slate-600 shadow-sm">Loading payment details...</div>
        ) : paymentData ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClassMap[paymentStatus] || 'bg-slate-100 text-slate-700'}`}>
                    {paymentStatus}
                  </span>
                  <h2 className="mt-3 text-2xl font-bold text-slate-900">UPI payment QR</h2>
                  <p className="mt-2 text-slate-600">Amount: Rs. {Number(paymentData.amount || 0).toFixed(2)}</p>
                </div>
                <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  Expires at: {paymentData.paymentExpiresAt ? new Date(paymentData.paymentExpiresAt).toLocaleString() : 'N/A'}
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center gap-5 md:flex-row md:items-start">
                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 shadow-inner">
                  {paymentData.qrCodeBase64 ? (
                    <img
                      src={`data:${paymentData.qrCodeContentType || 'image/png'};base64,${paymentData.qrCodeBase64}`}
                      alt="UPI payment QR"
                      className="h-[280px] w-[280px] rounded-2xl bg-white object-contain p-3"
                    />
                  ) : (
                    <div className="flex h-[280px] w-[280px] items-center justify-center rounded-2xl bg-white text-slate-500">
                      QR not available
                    </div>
                  )}
                </div>

                <div className="space-y-3 text-sm text-slate-700">
                  <p><span className="font-semibold text-slate-900">UPI ID:</span> {paymentData.upiId}</p>
                  <p><span className="font-semibold text-slate-900">Display name:</span> {paymentData.upiDisplayName}</p>
                  <p className="break-all"><span className="font-semibold text-slate-900">UPI URI:</span> {paymentData.paymentUri}</p>
                  <div className="flex flex-wrap gap-3 pt-3">
                    <button
                      type="button"
                      onClick={openInUpi}
                      className="rounded-md bg-rose-500 px-5 py-3 font-semibold text-white transition hover:bg-rose-600"
                    >
                      Open in UPI App
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/BookingQR', { state: { booking: { ...normalizedBooking, qrToken: paymentData.qrToken || normalizedBooking.qrToken } } })}
                      className="rounded-md border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
                    >
                      View Entry QR
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">Submit payment proof</h2>
              <p className="mt-2 text-slate-600">Upload a screenshot or submit the UTR reference so the owner can verify the transfer.</p>

              {paymentStatus === 'BOOKING_CONFIRMED' ? (
                <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-800">
                  Payment already confirmed. You can view the booking QR from your bookings page.
                </div>
              ) : paymentStatus === 'BOOKING_CANCELLED' ? (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
                  This payment window has expired or the booking was cancelled.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  <div>
                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-slate-700">Payment method</label>
                    <select
                      id="paymentMethod"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-rose-200 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-rose-400"
                    >
                      <option value="BOTH">Screenshot and UTR</option>
                      <option value="SCREENSHOT">Screenshot only</option>
                      <option value="UTR">UTR only</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="utrNumber" className="block text-sm font-medium text-slate-700">UTR number</label>
                    <input
                      id="utrNumber"
                      type="text"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder="Enter UTR / transaction reference"
                      className="mt-2 w-full rounded-xl border border-rose-200 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="screenshot" className="block text-sm font-medium text-slate-700">Payment screenshot</label>
                    <input
                      id="screenshot"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleScreenshotChange}
                      className="mt-2 block w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-rose-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-rose-600"
                    />
                  </div>

                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
                    Submit either a screenshot, a UTR number, or both. The backend checks ownership, duplicates, and status transitions.
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-md bg-rose-500 px-5 py-3 font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? 'Submitting...' : 'Submit Payment Proof'}
                  </button>
                </form>
              )}

              {booking?.paymentStatus === 'PAYMENT_SUBMITTED' && (
                <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-blue-800">
                  Payment proof submitted. The owner will review your payment and confirm the booking.
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
            Unable to load payment details.
          </div>
        )}
      </div>
    </main>
  );
};

export default BookingPayment;
