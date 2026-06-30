import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '/src/api';

const ResultBadge = ({ result }) => {
  const cfg = {
    SUCCESS: { bg: 'bg-emerald-50 border-emerald-200', icon: 'text-emerald-500', label: 'text-emerald-700', dot: 'bg-emerald-500' },
    EXPIRED: { bg: 'bg-amber-50 border-amber-200', icon: 'text-amber-500', label: 'text-amber-700', dot: 'bg-amber-500' },
    INVALID: { bg: 'bg-red-50 border-red-200', icon: 'text-red-500', label: 'text-red-700', dot: 'bg-red-500' },
  };
  const c = cfg[result?.result] || cfg.INVALID;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`mt-6 rounded-xl border p-4 ${c.bg}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${c.dot} mt-2`} />
        <div>
          <p className={`font-bold text-lg ${c.label}`}>{result?.result}</p>
          <p className="text-slate-700 mt-0.5">{result?.message}</p>
          {result?.bookingId && <p className="text-sm text-slate-500 mt-1">Booking ID: #{result.bookingId}</p>}
        </div>
      </div>
    </motion.div>
  );
};

const ValidateBookingQR = () => {
  const [tab, setTab] = useState('qr'); // 'qr' | 'otp'
  const [qrToken, setQrToken] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      e.preventDefault();
    }
  };

  const handleValidateQr = async (e) => {
    e.preventDefault();
    if (!qrToken.trim()) { setResult({ result: 'INVALID', message: 'Please enter a QR token.' }); return; }
    setLoading(true);
    try {
      const res = await api.post('/booking/validate-qr', { qrToken: qrToken.trim() });
      setResult(res.data);
    } catch { setResult({ result: 'INVALID', message: 'Validation failed. Please try again.' }); }
    finally { setLoading(false); }
  };

  const handleValidateOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setResult({ result: 'INVALID', message: 'Please enter all 6 OTP digits.' }); return; }
    setLoading(true);
    try {
      const res = await api.post('/booking/validate-otp', { otp: code });
      setResult(res.data);
    } catch { setResult({ result: 'INVALID', message: 'OTP validation failed. Please try again.' }); }
    finally { setLoading(false); }
  };

  const reset = () => { setResult(null); setQrToken(''); setOtp(['', '', '', '', '', '']); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-5">
            <h1 className="text-xl font-bold text-white">Verify Entry Pass</h1>
            <p className="text-white/70 text-sm mt-0.5">Scan QR code or enter customer OTP to grant entry</p>
          </div>

          <div className="p-6">
            {/* Tabs */}
            <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-50 mb-6">
              <button
                onClick={() => { setTab('qr'); reset(); }}
                className={`flex-1 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${tab === 'qr' ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                Scan / Paste QR
              </button>
              <button
                onClick={() => { setTab('otp'); reset(); }}
                className={`flex-1 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${tab === 'otp' ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                Verify OTP
              </button>
            </div>

            <AnimatePresence mode="wait">
              {tab === 'qr' ? (
                <motion.form key="qr" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleValidateQr} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">QR Token</label>
                    <textarea
                      value={qrToken}
                      onChange={(e) => setQrToken(e.target.value)}
                      placeholder="Paste the scanned QR token here..."
                      rows={3}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none transition-all"
                    />
                    <p className="text-xs text-slate-400 mt-1">Paste the full token from the customer&apos;s QR code</p>
                  </div>
                  <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Validating...</> : 'Validate QR'}
                  </button>
                </motion.form>
              ) : (
                <motion.form key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleValidateOtp} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3 text-center">Enter Customer&apos;s 6-Digit OTP</label>
                    <div className="flex items-center justify-center gap-2" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          id={`otp-${i}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className="w-11 h-14 text-center text-2xl font-bold border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800 transition-all"
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-2 text-center">Ask the customer for their OTP from the Booking Pass screen</p>
                  </div>
                  <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Verifying...</> : 'Verify OTP'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {result && <ResultBadge result={result} />}

            {result && (
              <button onClick={reset} className="mt-3 w-full py-2 text-sm text-slate-500 hover:text-rose-500 transition-colors">
                Clear &amp; try again
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ValidateBookingQR;
