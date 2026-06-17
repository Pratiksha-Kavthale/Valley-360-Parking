import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import api from '/src/api';
import { toast } from 'react-toastify';
import RatingSlider from './RatingSlider';

const ReviewModal = ({ booking, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    rating: 0,
    cleanliness: 0,
    security: 0,
    accessibility: 0,
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const commentCount = useMemo(() => form.comment.length, [form.comment]);
  const canSubmit = form.rating > 0 && !submitting;

  const setRating = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCommentChange = (event) => {
    const value = event.target.value.slice(0, 500);
    setForm((prev) => ({
      ...prev,
      comment: value,
    }));
  };

  const submitReview = async () => {
    if (!booking?.id) {
      toast.error('Booking not found for review.');
      return;
    }

    if (form.rating <= 0) {
      toast.error('Overall rating is required.');
      return;
    }

    const payload = {
      bookingId: booking.id,
      rating: Math.max(1, Math.round(form.rating)),
      cleanliness: Math.max(1, Math.round(form.cleanliness || form.rating)),
      security: Math.max(1, Math.round(form.security || form.rating)),
      accessibility: Math.max(1, Math.round(form.accessibility || form.rating)),
      comment: form.comment.trim(),
    };

    try {
      setSubmitting(true);
      await api.post('/reviews', payload);
      toast.success('Review submitted successfully.');
      onSuccess?.();
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to submit review.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl rounded-3xl border border-rose-100 bg-[#fffaf8] p-6 shadow-xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Leave Review</h2>
            <p className="mt-1 text-sm text-slate-600">
              Booking #{booking?.id} • {booking?.parkingAreaName || 'Parking Area'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="mt-5 max-h-96 space-y-3 overflow-y-auto pr-1">
          <RatingSlider label="Overall Rating" value={form.rating} onChange={(value) => setRating('rating', value)} />
          <RatingSlider label="Cleanliness" value={form.cleanliness} onChange={(value) => setRating('cleanliness', value)} />
          <RatingSlider label="Security" value={form.security} onChange={(value) => setRating('security', value)} />
          <RatingSlider label="Accessibility" value={form.accessibility} onChange={(value) => setRating('accessibility', value)} />

          <div className="rounded-xl border border-rose-100 bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="reviewComment" className="text-sm font-semibold text-slate-800">
                Comment
              </label>
              <span className="text-xs text-slate-500">{commentCount}/500</span>
            </div>
            <textarea
              id="reviewComment"
              rows="4"
              value={form.comment}
              onChange={handleCommentChange}
              placeholder="Share your parking experience..."
              className="w-full rounded-xl border border-rose-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submitReview}
            disabled={!canSubmit}
            className="rounded-md bg-gradient-to-r from-rose-500 to-orange-400 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ReviewModal;
