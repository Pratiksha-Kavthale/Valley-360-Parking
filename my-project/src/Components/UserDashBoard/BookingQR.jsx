import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  try { return new Date(value).toLocaleString(); } catch { return value; }
};

const BookingQR = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const booking = state?.booking;
  const [mode, setMode] = useState('qr'); // 'qr' | 'otp'

  if (!booking?.qrToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl border border-rose-200 shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Booking Pass Not Available</h2>
          <p className="mt-2 text-slate-500 text-sm">Complete a booking first to get your entry pass.</p>
          <button onClick={() => navigate('/UserDashBoard')} className="mt-6 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-xl py-2.5 px-6 font-medium hover:shadow-lg transition-all">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const statusColors = { ACTIVE: 'bg-emerald-100 text-emerald-700', RESERVED: 'bg-amber-100 text-amber-700', USED: 'bg-slate-100 text-slate-700', COMPLETED: 'bg-blue-100 text-blue-700', EXPIRED: 'bg-red-100 text-red-700' };
  const statusClass = statusColors[String(booking.status).toUpperCase()] || 'bg-slate-100 text-slate-700';

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Boarding-pass card */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header strip */}
          <div className="bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-xs font-medium uppercase tracking-widest">Parking Pass</p>
                <h1 className="text-white text-xl font-bold mt-0.5">Valley 360</h1>
              </div>
              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass}`}>{booking.status || 'ACTIVE'}</span>
                <p className="text-white/70 text-xs mt-1">ID #{booking.id}</p>
              </div>
            </div>
          </div>

          {/* Ticket body */}
          <div className="px-6 py-5 space-y-4">
            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Parking Area</p>
                <p className="font-semibold text-slate-800 mt-0.5">{booking.parkingAreaName || 'N/A'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Slot</p>
                <p className="font-semibold text-slate-800 mt-0.5">#{booking.slotNumber ?? booking.parking_slot_id ?? 'N/A'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Check-in</p>
                <p className="font-semibold text-slate-800 mt-0.5 text-xs">{formatDateTime(booking.startTime || booking.arrivalDate)}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Check-out</p>
                <p className="font-semibold text-slate-800 mt-0.5 text-xs">{formatDateTime(booking.endTime || booking.departureDate)}</p>
              </div>
            </div>

            {/* Dashed divider */}
            <div className="border-t-2 border-dashed border-slate-200 my-1" />

            {/* Mode toggle */}
            <div>
              <p className="text-xs text-slate-500 font-medium mb-2 text-center">Choose how to show your pass at entry</p>
              <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <button
                  onClick={() => setMode('qr')}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${mode === 'qr' ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                  QR Code
                </button>
                <button
                  onClick={() => setMode('otp')}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${mode === 'otp' ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  OTP
                </button>
              </div>
            </div>

            {/* QR or OTP display */}
            <AnimatePresence mode="wait">
              {mode === 'qr' ? (
                <motion.div key="qr" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center gap-3 py-2">
                  <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-inner">
                    <QRCodeSVG value={booking.qrToken} size={180} includeMargin={false} level="M" />
                  </div>
                  <p className="text-xs text-slate-400 text-center">Show this QR code to the owner/admin at entry</p>
                </motion.div>
              ) : (
                <motion.div key="otp" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center gap-3 py-2">
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-200 px-8 py-6 text-center w-full">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mb-2">Your Entry OTP</p>
                    <div className="flex items-center justify-center gap-2">
                      {(booking.otp || '------').split('').map((digit, i) => (
                        <span key={i} className="w-10 h-12 bg-white border-2 border-rose-200 rounded-xl flex items-center justify-center text-2xl font-bold text-rose-600 shadow-sm">
                          {digit}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-3">Tell this 6-digit OTP to the owner/admin at entry</p>
                  </div>
                  {!booking.otp && (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-center">
                      OTP not available. Please re-open this page from My Bookings.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <button
              onClick={() => navigate('/user/bookings')}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition-all"
            >
              Back to My Bookings
            </button>
          </div>
        </motion.div>

        <p className="text-center text-xs text-slate-400 mt-4">
          This pass is valid for the booked time window only
        </p>
      </div>
    </div>
  );
};

export default BookingQR;
