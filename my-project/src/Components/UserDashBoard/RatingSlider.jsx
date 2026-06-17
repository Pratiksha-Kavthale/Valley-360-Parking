import { useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const RatingSlider = ({ label, value = 0, onChange }) => {
  const trackRef = useRef(null);
  const isDraggingRef = useRef(false);

  const updateFromClientX = useCallback((clientX) => {
    const track = trackRef.current;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    const nextValue = Number((ratio * 5).toFixed(1));
    onChange(nextValue);
  }, [onChange]);

  const handlePointerDown = (event) => {
    isDraggingRef.current = true;
    updateFromClientX(event.clientX);
  };

  useEffect(() => {
    const handlePointerMove = (event) => {
      if (!isDraggingRef.current) return;
      updateFromClientX(event.clientX);
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [updateFromClientX]);

  const handleKeyDown = (event) => {
    const current = Number(value) || 0;

    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      onChange(Number(clamp(current + 0.1, 0, 5).toFixed(1)));
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      onChange(Number(clamp(current - 0.1, 0, 5).toFixed(1)));
    }

    if (event.key === 'Home') {
      event.preventDefault();
      onChange(0);
    }

    if (event.key === 'End') {
      event.preventDefault();
      onChange(5);
    }
  };

  const widthPercent = clamp((value / 5) * 100, 0, 100);

  return (
    <div className="rounded-xl border border-rose-100 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="text-sm font-semibold text-rose-600">{Number(value || 0).toFixed(1)}/5</p>
      </div>

      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={5}
        aria-valuenow={Number((value || 0).toFixed(1))}
        aria-valuetext={`${Number(value || 0).toFixed(1)} out of 5`}
        className="relative h-4 cursor-pointer overflow-hidden rounded-[10px] bg-slate-200 outline-none focus:ring-2 focus:ring-rose-300"
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-[10px] bg-gradient-to-r from-rose-400 to-orange-300"
          animate={{ width: `${widthPercent}%` }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-slate-500">
        <span>0</span>
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
    </div>
  );
};

export default RatingSlider;
