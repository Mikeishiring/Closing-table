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
  const HANDLE_SIZE = 44; // px
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

  const fillStyle = '#007AFF';

  return (
    <div className="slide-cta focus-priority">
      <div
        ref={trackRef}
        className={`slide-track relative w-full overflow-hidden select-none ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        }`}
        style={{
          touchAction: 'none',
          height: '64px',
          borderRadius: '16px',
          border: '1px solid #E5E5EA',
          background: '#F2F2F7',
        }}
      >
        <div
          className="absolute inset-y-0 left-0"
          style={{
            width: `${progress}%`,
            background: fillStyle,
            transition: dragging ? 'none' : 'width 180ms ease',
            opacity: locked || loading ? 0.25 : 0.18,
          }}
        />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="cta-label transition-opacity"
            style={{ opacity: 1 - Math.min(progress / 100, 1) }}
          >
            {text}
          </span>
        </div>

        <motion.div
          className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
          drag="x"
          dragConstraints={{ left: dragBounds.left, right: dragBounds.right }}
          dragElastic={0}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          animate={controls}
          initial={{ x: 0 }}
          style={{
            touchAction: 'none',
            height: '44px',
            width: '44px',
            borderRadius: '50%',
            backgroundColor: '#fff',
            border: '1px solid #E5E5EA',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          }}
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

