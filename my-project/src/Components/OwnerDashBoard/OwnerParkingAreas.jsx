import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import api from '/src/api';
import Footer from '../Footer/Footer';

const OwnerParkingAreas = () => {
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAreas = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/owner/parking-areas');
      setAreas(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || 'Failed to load parking areas.';
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
    const sessionToken = sessionStorage.getItem('token');
    const localToken = localStorage.getItem('token');
    if (!sessionToken && localToken) {
      sessionStorage.setItem('token', localToken);
    }
    fetchAreas();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-100 to-amber-200 overflow-x-hidden">
      <section className="py-10 sm:py-16">
        <div className="container mx-auto max-w-[1200px] px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="text-sm text-slate-500">Owner &gt; Areas</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">My Parking Areas</h1>
            <p className="mt-2 text-slate-600">Select an area to inspect slots and booking timeline.</p>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-4 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
            >
              Back
            </button>
          </div>

          <ToastContainer position="top-center" />

          {loading && <div className="mt-8 rounded-2xl bg-white p-6 text-slate-600">Loading areas...</div>}
          {!loading && error && <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>}

          {!loading && !error && (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {areas.map((area, index) => (
                <motion.article
                  key={area.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  onClick={() => navigate(`/owner/parking-areas/${area.id}/slots`)}
                >
                  <h3 className="text-xl font-bold text-slate-900">{area.area}</h3>
                  <p className="mt-2 text-slate-600">{area.city}</p>
                  <p className="text-sm text-slate-500">Pin: {area.pincode}</p>
                  <p className="mt-3 inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                    {area.status}
                  </p>
                </motion.article>
              ))}
            </div>
          )}

          {!loading && !error && areas.length === 0 && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">No parking areas found.</div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default OwnerParkingAreas;
