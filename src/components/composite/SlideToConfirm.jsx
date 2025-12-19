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
  const [trackWidth, setTrackWidth] = useState(0);

  // Measure track width to set drag bounds
  useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const width = rect.width || 0;
      setTrackWidth(width);
      const right = Math.max(0, width - HANDLE_SIZE);
      setDragBounds({ left: 0, right });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [HANDLE_SIZE]);

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
      if (!trackWidth) return 0;
      const pct = (handleX / (trackWidth - HANDLE_SIZE)) * 100;
      return Math.min(100, Math.max(0, pct));
    },
    [trackWidth, HANDLE_SIZE]
  );

  const handleDrag = (_, info) => {
    if (!trackWidth) return;
    const clampedX = Math.min(Math.max(info.offset.x, 0), Math.max(0, trackWidth - HANDLE_SIZE));
    const pct = calcProgress(clampedX);
    setProgress(pct);
  };

  const handleKeyDown = async (event) => {
    if (disabled || loading) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setLocked(true);
      setProgress(100);
      await controls.start({ x: Math.max(0, trackWidth - HANDLE_SIZE) });
      onConfirm?.();
    }
  };

  const handleDragEnd = async (_, info) => {
    setDragging(false);

    const finalOffset = Math.min(
      Math.max(info?.offset?.x ?? 0, 0),
      Math.max(0, trackWidth - HANDLE_SIZE)
    );
    const pct = calcProgress(finalOffset);
    setProgress(pct);

    if (pct >= 92 && !locked && !loading) {
      setLocked(true);
      setProgress(100);
      await controls.start({ 
        x: Math.max(0, trackWidth - HANDLE_SIZE),
        transition: { type: "spring", damping: 25, stiffness: 350 }
      });
      onConfirm?.();
    } else {
      setProgress(0);
      await controls.start({ 
        x: 0,
        transition: { type: "spring", damping: 28, stiffness: 400 }
      });
    }
  };

  const handleDragStart = () => {
    if (disabled || loading || locked) return false;
    setDragging(true);
    return true;
  };

  const fillStyle = 'var(--accent-primary)';

  return (
    <div className="slide-cta focus-priority">
      <div
        ref={trackRef}
        className={`slide-track relative w-full overflow-hidden select-none ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        }`}
        style={{
          touchAction: 'none',
          height: '56px',
          borderRadius: '999px',
          border: '1px solid var(--border-subtle)',
          background: 'rgba(255,255,255,0.9)',
          boxShadow: '0 18px 40px -28px rgba(7,11,24,0.45), inset 0 1px 0 rgba(255,255,255,0.8)',
        }}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-valuetext={locked ? 'Locked' : text}
        aria-label={text}
        onKeyDown={handleKeyDown}
      >
        <div
          className="absolute inset-y-0 left-0"
          style={{
            width: `${progress}%`,
            background: fillStyle,
            transition: dragging ? 'none' : 'width 220ms cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: locked || loading ? 0.32 : 0.22,
            borderRadius: '999px',
          }}
        />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="cta-label transition-opacity"
            aria-live="polite"
            style={{ opacity: 1 - Math.min(progress / 100, 1) }}
          >
            {text}
          </span>
        </div>

        <motion.div
          className="absolute top-1/2 left-[6px] flex items-center justify-center"
          drag="x"
          dragConstraints={{ left: dragBounds.left, right: dragBounds.right }}
          dragElastic={0.05}
          dragMomentum={false}
          dragTransition={{ power: 0.15, timeConstant: 150 }}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          animate={controls}
          initial={{ x: 0 }}
          style={{
            touchAction: 'none',
            height: '44px',
            width: '44px',
            marginTop: '-22px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-card-strong, #fff)',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 12px 30px -20px rgba(7,11,24,0.48), 0 2px 10px -8px rgba(7,11,24,0.32), 0 1px 0 rgba(255,255,255,0.8)',
            cursor: dragging ? 'grabbing' : 'grab',
          }}
          whileTap={{ scale: 0.96 }}
          whileHover={!disabled && !loading ? { scale: 1.04 } : undefined}
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
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
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center justify-center text-slate-700 font-semibold"
                style={{ 
                  fontSize: '20px',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%'
                }}
              >
                {locked ? '🔒' : '→'}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}


