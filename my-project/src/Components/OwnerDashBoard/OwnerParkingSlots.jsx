import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import api from '/src/api';
import Footer from '../Footer/Footer';

const OwnerParkingSlots = () => {
  const navigate = useNavigate();
  const { areaId } = useParams();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSlots = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/owner/parking-area/${areaId}/slots`);
      setSlots(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || 'Failed to load parking slots.';
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
    fetchSlots();
  }, [areaId]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-100 to-amber-200 overflow-x-hidden">
      <section className="py-10 sm:py-16">
        <div className="container mx-auto max-w-[1200px] px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="text-sm text-slate-500">Owner &gt; Areas &gt; Slots</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Area Slots</h1>
            <p className="mt-2 text-slate-600">Select a slot to view booking timeline history.</p>
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
              >
                Back
              </button>

              <button
                type="button"
                onClick={() => navigate('/owner/add-slot', { state: { areaId } })}
                className="bg-rose-400 text-white px-4 py-2 rounded-lg shadow-sm hover:scale-105 transition"
              >
                Add Slot
              </button>
            </div>
          </div>

          <ToastContainer position="top-center" />

          {loading && <div className="mt-8 rounded-2xl bg-white p-6 text-slate-600">Loading slots...</div>}
          {!loading && error && <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>}

          {!loading && !error && (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {slots.map((slot, index) => (
                <motion.article
                  key={slot.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  onClick={() => navigate(`/owner/slots/${slot.id}/timeline`)}
                >
                  <h3 className="text-xl font-bold text-slate-900">Slot #{slot.id}</h3>
                  <p className="mt-2 text-slate-600">Vehicle: {slot.vehicleType}</p>
                  <p className="text-slate-600">Price/hr: Rs. {Number(slot.price || 0).toFixed(2)}</p>
                  <p className="mt-3 inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                    {slot.status}
                  </p>
                </motion.article>
              ))}
            </div>
          )}

          {!loading && !error && slots.length === 0 && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">No slots found for this area.</div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default OwnerParkingSlots;
