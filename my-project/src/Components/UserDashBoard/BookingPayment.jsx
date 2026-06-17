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
  const [debugMode, setDebugMode] = useState(localStorage.getItem('DEBUG_UPI_QR') === 'true');
  const [qrDebugInfo, setQrDebugInfo] = useState('');

  useEffect(() => {
    const loadPaymentQr = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/booking/${bookingId}/payment-qr`);
        setPaymentData(response.data);
        
        // Log payment URI for debugging
        if (debugMode) {
          console.log('Payment QR Data:', response.data);
          setQrDebugInfo(`UPI URI: ${response.data.paymentUri}\n\nQR Content loaded successfully.`);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Unable to load payment QR.');
        if (debugMode) {
          setQrDebugInfo(`Error: ${error?.response?.data?.message || error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    loadPaymentQr();
  }, [bookingId, debugMode]);

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

  /**
   * Open UPI app with payment URI (mobile deep-link support)
   * On mobile: Opens installed UPI app (Google Pay, PhonePe, Paytm, BHIM, etc.)
   * On desktop: Might not work (UPI is mobile-only)
   */
  const openInUpi = () => {
    if (!paymentData?.paymentUri) {
      toast.error('Payment URI not available');
      return;
    }

    if (debugMode) {
      console.log('Opening UPI URI:', paymentData.paymentUri);
    }

    // Use window.location.href for deep-link on mobile
    // On iOS/Android, this will trigger the UPI app chooser
    window.location.href = paymentData.paymentUri;

    // For devices that might not support UPI, provide fallback
    setTimeout(() => {
      toast.info('If UPI app did not open, please manually scan the QR code or copy the payment details.');
    }, 1500);
  };

  /**
   * Copy UPI URI to clipboard for manual use
   */
  const copyUriToClipboard = async () => {
    if (!paymentData?.paymentUri) {
      toast.error('Payment URI not available');
      return;
    }

    try {
      await navigator.clipboard.writeText(paymentData.paymentUri);
      toast.success('UPI URI copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  /**
   * Toggle debug mode (enable with localStorage flag)
   */
  const toggleDebugMode = () => {
    const newDebugMode = !debugMode;
    setDebugMode(newDebugMode);
    localStorage.setItem('DEBUG_UPI_QR', newDebugMode ? 'true' : 'false');
    if (newDebugMode) {
      toast.info('Debug mode enabled. Check browser console.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800">
      <ToastContainer position="top-center" />
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-rose-100 p-2.5 text-rose-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Payment for Booking #{normalizedBooking.id}</h1>
                <p className="text-slate-600">Scan QR or use UPI app to complete payment</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={toggleDebugMode}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
                title="Toggle debug mode"
              >
                {debugMode ? 'Debug ON' : 'Debug'}
              </button>
              <button
                onClick={() => navigate('/user/bookings')}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
              >
                Back to Bookings
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <svg className="animate-spin w-8 h-8 text-rose-500 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-3 text-slate-600">Loading payment details...</p>
          </div>
        ) : paymentData ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            {/* QR Section */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <h2 className="text-lg font-semibold">UPI Payment QR</h2>
                    <p className="text-white/80 text-sm">Amount: Rs. {Number(paymentData.amount || 0).toFixed(2)}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClassMap[paymentStatus] || 'bg-slate-100 text-slate-700'}`}>
                    {paymentStatus.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-col items-center gap-5 md:flex-row md:items-start">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    {paymentData.qrCodeBase64 ? (
                      <img
                        src={`data:${paymentData.qrCodeContentType || 'image/png'};base64,${paymentData.qrCodeBase64}`}
                        alt="UPI payment QR"
                        className="h-[240px] w-[240px] rounded-lg bg-white object-contain p-2"
                      />
                    ) : (
                      <div className="flex h-[240px] w-[240px] items-center justify-center rounded-lg bg-white text-slate-500">
                        QR not available
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                      <p className="text-xs text-slate-500">UPI ID</p>
                      <p className="font-medium text-slate-900">{paymentData.upiId}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                      <p className="text-xs text-slate-500">Display Name</p>
                      <p className="font-medium text-slate-900">{paymentData.upiDisplayName}</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-3 border border-amber-100">
                      <p className="text-xs text-amber-600">Expires At</p>
                      <p className="font-medium text-amber-800">{paymentData.paymentExpiresAt ? new Date(paymentData.paymentExpiresAt).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={openInUpi}
                    className="flex-1 min-w-[140px] rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2.5 font-medium text-white transition hover:from-rose-600 hover:to-orange-600 text-sm"
                  >
                    Open in UPI App
                  </button>
                  <button
                    type="button"
                    onClick={copyUriToClipboard}
                    className="flex-1 min-w-[120px] rounded-lg border border-slate-200 bg-white px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50 text-sm"
                  >
                    Copy URI
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/BookingQR', { state: { booking: { ...normalizedBooking, qrToken: paymentData.qrToken || normalizedBooking.qrToken } } })}
                    className="flex-1 min-w-[120px] rounded-lg border border-slate-200 bg-white px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50 text-sm"
                  >
                    View Entry QR
                  </button>
                </div>

                {debugMode && qrDebugInfo && (
                  <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-600 whitespace-pre-wrap">
                    {qrDebugInfo}
                  </div>
                )}
              </div>
            </section>

            {/* Payment Form Section */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-slate-800 px-6 py-4">
                <h2 className="text-lg font-semibold text-white">Submit Payment Proof</h2>
                <p className="text-slate-300 text-sm">Upload screenshot or enter UTR for verification</p>
              </div>

              <div className="p-6">
                {paymentStatus === 'BOOKING_CONFIRMED' ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Payment confirmed! View booking QR from your bookings page.</span>
                  </div>
                ) : paymentStatus === 'BOOKING_CANCELLED' ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700">
                    This payment window has expired or the booking was cancelled.
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="paymentMethod" className="block text-sm font-medium text-slate-700 mb-1.5">Payment Method</label>
                      <select
                        id="paymentMethod"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors appearance-none bg-white"
                      >
                        <option value="BOTH">Screenshot and UTR</option>
                        <option value="SCREENSHOT">Screenshot only</option>
                        <option value="UTR">UTR only</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="utrNumber" className="block text-sm font-medium text-slate-700 mb-1.5">UTR Number</label>
                      <input
                        id="utrNumber"
                        type="text"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        placeholder="Enter UTR / transaction reference"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="screenshot" className="block text-sm font-medium text-slate-700 mb-1.5">Payment Screenshot</label>
                      <input
                        id="screenshot"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleScreenshotChange}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-rose-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-rose-600"
                      />
                    </div>

                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      Submit either a screenshot, UTR number, or both. Owner will verify and confirm.
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold rounded-lg shadow-lg hover:from-rose-600 hover:to-orange-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        'Submit Payment Proof'
                      )}
                    </button>
                  </form>
                )}

                {booking?.paymentStatus === 'PAYMENT_SUBMITTED' && (
                  <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800 flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>Payment proof submitted. Owner will review and confirm your booking.</span>
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Unable to load payment details.
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default BookingPayment;
