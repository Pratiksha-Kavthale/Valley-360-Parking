import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '/src/api';

const animatedVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: 0.08 * index },
  }),
};

const StatBar = ({ label, value }) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  const widthPercent = Math.max(0, Math.min(100, (safeValue / 5) * 100));

  return (
    <div className="rounded-xl border border-rose-100 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-semibold text-rose-600">{safeValue.toFixed(2)}/5</span>
      </div>
      <div className="h-3 overflow-hidden rounded-[10px] bg-slate-200">
        <motion.div
          className="h-full rounded-[10px] bg-gradient-to-r from-rose-400 to-orange-300"
          initial={{ width: 0 }}
          whileInView={{ width: `${widthPercent}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
};

const ParkingReviews = ({ parkingId }) => {
  const [summary, setSummary] = useState({
    avgRating: 0,
    avgCleanliness: 0,
    avgSecurity: 0,
    avgAccessibility: 0,
    totalReviews: 0,
  });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!parkingId) return;

      try {
        setLoading(true);
        const [summaryResponse, reviewResponse] = await Promise.all([
          api.get(`/reviews/average/${parkingId}`),
          api.get(`/reviews/parking/${parkingId}`),
        ]);

        setSummary(summaryResponse.data || {});
        setReviews(Array.isArray(reviewResponse.data) ? reviewResponse.data : []);
      } catch {
        setSummary({
          avgRating: 0,
          avgCleanliness: 0,
          avgSecurity: 0,
          avgAccessibility: 0,
          totalReviews: 0,
        });
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [parkingId]);

  return (
    <section className="mt-12 rounded-3xl border border-rose-100 bg-[#fff8f5] p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Parking Reviews</h2>
          <p className="mt-1 text-sm text-slate-600">Real feedback from verified bookings.</p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-white px-5 py-3 text-center shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Average Rating</p>
          <p className="text-3xl font-bold text-rose-600">{Number(summary.avgRating || 0).toFixed(2)}</p>
          <p className="text-xs text-slate-500">{summary.totalReviews || 0} reviews</p>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Loading reviews...</div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <StatBar label="Overall" value={Number(summary.avgRating || 0)} />
            <StatBar label="Cleanliness" value={Number(summary.avgCleanliness || 0)} />
            <StatBar label="Security" value={Number(summary.avgSecurity || 0)} />
            <StatBar label="Accessibility" value={Number(summary.avgAccessibility || 0)} />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {reviews.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
                No reviews yet for this parking area.
              </div>
            )}

            {reviews.map((review, index) => (
              <motion.article
                key={review.id || `${review.userId}-${index}`}
                custom={index}
                variants={animatedVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{review.userName || 'User'}</h3>
                    <p className="text-xs text-slate-500">{formatDate(review.createdAt)}</p>
                  </div>
                  <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                    {Number(review.rating || 0).toFixed(1)}/5
                  </span>
                </div>

                <div className="space-y-2">
                  <StatBar label="Overall" value={Number(review.rating || 0)} />
                  <StatBar label="Cleanliness" value={Number(review.cleanliness || 0)} />
                  <StatBar label="Security" value={Number(review.security || 0)} />
                  <StatBar label="Accessibility" value={Number(review.accessibility || 0)} />
                </div>

                {review.comment && (
                  <p className="mt-4 text-sm leading-6 text-slate-600">{review.comment}</p>
                )}
              </motion.article>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default ParkingReviews;
