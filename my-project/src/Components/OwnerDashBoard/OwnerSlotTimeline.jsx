import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import api from '/src/api';
import Footer from '../Footer/Footer';

const statusClass = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  RESERVED: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-slate-200 text-slate-700',
};

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const OwnerSlotTimeline = () => {
  const navigate = useNavigate();
  const { slotId } = useParams();
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/owner/slot/${slotId}/timeline`);
      setTimeline(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || 'Failed to load slot timeline.';
      if (status === 401 || status === 403) {
        navigate('/Login');
        return;
      }
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [slotId]);

  useEffect(() => {
    if (scrollRef.current && timeline.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [timeline]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-100 to-amber-200 overflow-x-hidden">
      <section className="py-10 sm:py-16">
        <div className="container mx-auto max-w-[1200px] px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="text-sm text-slate-500">Owner &gt; Areas &gt; Slots &gt; Timeline</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Slot Booking Timeline</h1>
            <p className="mt-2 text-slate-600">Booking history for slot #{slotId}</p>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-4 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
            >
              Back
            </button>
          </div>

          <ToastContainer position="top-center" />

          {loading && <div className="mt-8 rounded-2xl bg-white p-6 text-slate-600">Loading timeline...</div>}
          {!loading && error && <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>}

          {!loading && !error && timeline.length === 0 && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
              No booking history for this slot
            </div>
          )}

          {!loading && !error && timeline.length > 0 && (
            <div className="relative mt-10 rounded-3xl border border-slate-200 bg-white/80 p-4 sm:p-6 shadow-sm">
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-10 rounded-t-3xl bg-gradient-to-b from-rose-100/95 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-10 rounded-b-3xl bg-gradient-to-t from-rose-100/95 to-transparent" />

              <div
                ref={scrollRef}
                className="timeline-scroll relative h-[420px] overflow-y-auto scroll-smooth pb-8 pt-2"
              >
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="hidden md:block absolute left-1/2 top-0 h-full w-px -translate-x-1/2 origin-top bg-rose-200"
                />

                <div className="space-y-8 pr-1">
                  {timeline.map((booking, index) => {
                    const status = String(booking.status || 'COMPLETED').toUpperCase();
                    const badge = statusClass[status] || 'bg-slate-200 text-slate-700';
                    const isLeft = index % 2 === 0;

                    return (
                      <motion.div
                        key={booking.bookingId}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.08 }}
                        viewport={{ once: false, amount: 0.2 }}
                        className={`relative flex w-full ${isLeft ? 'md:justify-start' : 'md:justify-end'} justify-start`}
                      >
                        <div className="hidden md:block absolute left-1/2 top-10 h-3 w-3 -translate-x-1/2 rounded-full border border-rose-300 bg-white" />

                        <motion.article
                          whileHover={{ scale: 1.02 }}
                          className="w-full md:w-[46%] rounded-2xl border border-slate-200 bg-[#fffaf7] p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-lg font-bold text-slate-900">Booking #{booking.bookingId}</h3>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge}`}>{status}</span>
                          </div>

                          <p className="mt-3 text-slate-700"><span className="font-semibold">User Name:</span> {booking.userName}</p>
                          <p className="mt-2 text-slate-600">
                            <span className="font-semibold text-slate-700">Start Time:</span> {formatDateTime(booking.startTime)}
                          </p>
                          <p className="mt-1 text-slate-600">
                            <span className="font-semibold text-slate-700">End Time:</span> {formatDateTime(booking.endTime)}
                          </p>
                        </motion.article>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default OwnerSlotTimeline;
