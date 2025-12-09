import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

/**
 * Slide-to-confirm control to add intentional friction before submission.
 */
export function SlideToConfirm({
  text = 'Slide to Lock Offer',
  onConfirm,
  loading = false,
  disabled = false,
}) {
  const trackRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [locked, setLocked] = useState(false);
  const controls = useAnimation();
  const HANDLE_SIZE = 48; // px
  const [dragBounds, setDragBounds] = useState({ left: 0, right: 0 });

  // Measure track width to set drag bounds
  useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      const width = trackRef.current.getBoundingClientRect().width || 0;
      const right = Math.max(0, width - HANDLE_SIZE);
      setDragBounds({ left: 0, right });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const reset = useCallback(() => {
    setProgress(0);
    setLocked(false);
    setDragging(false);
  }, []);

  useEffect(() => {
    if (!loading && locked) {
      reset();
    }
  }, [loading, locked, reset]);

  const calcProgress = useCallback(
    (handleX) => {
      if (!trackRef.current) return 0;
      const width = trackRef.current.getBoundingClientRect().width;
      if (!width) return 0;
      const pct = ((handleX + HANDLE_SIZE / 2) / width) * 100;
      return Math.min(100, Math.max(0, pct));
    },
    []
  );

  const handleDrag = (_, info) => {
    if (!trackRef.current) return;
    const width = trackRef.current.getBoundingClientRect().width;
    const clampedX = Math.min(Math.max(info.offset.x, 0), Math.max(0, width - HANDLE_SIZE));
    const pct = calcProgress(clampedX);
    setProgress(pct);
  };

  const handleDragEnd = async (_, info) => {
    if (!trackRef.current) return;
    const width = trackRef.current.getBoundingClientRect().width;
    setDragging(false);

    const finalOffset = Math.min(
      Math.max(info?.offset?.x ?? 0, 0),
      Math.max(0, width - HANDLE_SIZE)
    );
    const pct = calcProgress(finalOffset);
    setProgress(pct);

    if (pct >= 95 && !locked && !loading) {
      setLocked(true);
      setProgress(100);
      await controls.start({ x: Math.max(0, width - HANDLE_SIZE) });
      onConfirm?.();
    } else {
      setProgress(0);
      await controls.start({ x: 0 });
    }
  };

  const handleDragStart = () => {
    if (disabled || loading || locked) return false;
    setDragging(true);
    return true;
  };

  const fillStyle = locked || loading
    ? 'linear-gradient(90deg, #10b981, #22d3ee)'
    : 'linear-gradient(90deg, rgba(148, 163, 184, 0.55), rgba(148, 163, 184, 0.75))';

  return (
    <div className="focus-priority">
      <div
        ref={trackRef}
        className={`relative w-full h-14 rounded-full bg-slate-100 border border-slate-200 overflow-hidden select-none ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        }`}
        style={{ touchAction: 'none' }}
      >
        <div
          className="absolute inset-y-0 left-0"
          style={{
            width: `${progress}%`,
            background: fillStyle,
            transition: dragging ? 'none' : 'width 180ms ease',
            opacity: locked || loading ? 1 : 0.9,
          }}
        />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="text-sm font-semibold text-slate-500 transition-opacity"
            style={{ opacity: 1 - Math.min(progress / 100, 1) }}
          >
            {text}
          </span>
        </div>

        <motion.div
          className="absolute top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center"
          drag="x"
          dragConstraints={{ left: dragBounds.left, right: dragBounds.right }}
          dragElastic={0}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          animate={controls}
          initial={{ x: 0 }}
          style={{ touchAction: 'none' }}
          whileTap={{ scale: 1.02 }}
          whileHover={!disabled && !loading ? { scale: 1.01 } : undefined}
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="spinner"
                className="h-5 w-5 rounded-full border-2 border-slate-300 border-t-emerald-500 animate-spin"
              />
            ) : (
              <motion.div
                key="arrow"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-slate-600 text-lg"
              >
                ➜
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

