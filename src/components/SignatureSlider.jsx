/**
 * SignatureSlider Component
 * Custom slider with pen emoji thumb - Enhanced with haptics and animations
 * Features: milestone bumps, min/max feedback, home animation, ink droplet, ghost signature
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { 
  getSnapPointsInRange, 
  getSnapPointPercent, 
  getNearestSnapPoint,
  applySnapBehavior 
} from '../lib/deal';
import { useHaptics, useReducedMotion } from '../hooks';

// Session storage key for intro animation
const INTRO_PLAYED_KEY = 'closing-table-signature-intro-played';

/**
 * Milestones for haptic feedback (every $50k)
 */
const MILESTONES = [100_000, 150_000, 200_000, 250_000, 300_000, 350_000, 400_000];

/**
 * Reusable slider thumb with pen emoji
 */
export const SalarySliderThumb = () => (
  <span
    style={{
      fontSize: '23px',
      lineHeight: 0,
      transform: 'rotate(-25deg) translateY(1.7px)',
      userSelect: 'none',
      display: 'inline-block',
    }}
  >
    ✒️
  </span>
);

/**
 * Ink Droplet Effect Component
 */
const InkDroplet = ({ show, reducedMotion }) => {
  if (!show) return null;

  if (reducedMotion) {
    return (
      <div
        style={{
          position: 'absolute',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 196, 204, 0.6)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0.8 }}
      animate={{ scale: 1.1, opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: 'rgba(0, 196, 204, 0.5)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        filter: 'blur(1px)',
        pointerEvents: 'none',
      }}
    />
  );
};

/**
 * Ghost Signature Path SVG Component
 */
const GhostSignaturePath = ({ show, sliderWidth, reducedMotion }) => {
  const pathRef = useRef(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  if (!show || reducedMotion) {
    // Show subtle underline for reduced motion
    if (show && reducedMotion) {
      return (
        <div
          style={{
            position: 'absolute',
            left: '10%',
            right: '10%',
            bottom: '-4px',
            height: '2px',
            backgroundColor: 'rgba(0, 196, 204, 0.4)',
            borderRadius: '1px',
          }}
        />
      );
    }
    return null;
  }

  return (
    <motion.svg
      style={{
        position: 'absolute',
        top: '-8px',
        left: '1.3rem',
        right: '1.3rem',
        width: 'calc(100% - 2.6rem)',
        height: '20px',
        overflow: 'visible',
        pointerEvents: 'none',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.path
        ref={pathRef}
        d="M0,10 Q20,5 40,10 T80,8 Q100,6 120,10 T160,8"
        fill="none"
        stroke="#00C4CC"
        strokeWidth="1.5"
        strokeLinecap="round"
        style={{
          pathLength: 160,
        }}
        initial={{ 
          strokeDasharray: pathLength || 160,
          strokeDashoffset: pathLength || 160,
          opacity: 0 
        }}
        animate={{ 
          strokeDashoffset: 0,
          opacity: [0, 1, 1, 0],
        }}
        transition={{ 
          strokeDashoffset: { duration: 0.4, ease: 'easeOut' },
          opacity: { duration: 1.2, times: [0, 0.1, 0.7, 1] }
        }}
      />
    </motion.svg>
  );
};

/**
 * Signature Slider with haptics and micro-animations
 */
function SignatureSliderComponent({
  value,
  min,
  max,
  step = 1000,
  onChange,
  variant = 'company',
  label,
  onDragStart,
  onDragEnd,
  enableSnapPoints = true,
  showSignatureFlourish = false,
  thumbEmoji = null,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [showInkDot, setShowInkDot] = useState(false);
  const [showInkDroplet, setShowInkDroplet] = useState(false);
  const [inkDotPosition, setInkDotPosition] = useState(0);
  const [activeSnapPoint, setActiveSnapPoint] = useState(null);
  const [snapPulse, setSnapPulse] = useState(false);
  const [milestoneBump, setMilestoneBump] = useState(false);
  const [endBounce, setEndBounce] = useState(null); // 'min' | 'max' | null
  const [hasPlayedIntro, setHasPlayedIntro] = useState(true);
  const [introOffset, setIntroOffset] = useState(0);
  
  const lastValueRef = useRef(value);
  const lastMilestoneRef = useRef(null);
  const lastSnapPointRef = useRef(null);
  const sliderRef = useRef(null);
  const dragStartTriggeredRef = useRef(false);

  const haptics = useHaptics();
  const reducedMotion = useReducedMotion();

  // Check and run intro animation on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const introPlayed = sessionStorage.getItem(INTRO_PLAYED_KEY);
      if (introPlayed === 'true') {
        setHasPlayedIntro(true);
        return;
      }
      
      // Run intro animation if not played and motion is allowed
      if (!reducedMotion) {
        setHasPlayedIntro(false);
        // Small delay before animation
        const timer = setTimeout(() => {
          // Animate intro offset: 0 -> 6 -> 0
          animate(0, 6, {
            duration: 0.15,
            ease: 'easeOut',
            onUpdate: (v) => setIntroOffset(v),
            onComplete: () => {
              animate(6, 0, {
                duration: 0.2,
                ease: 'easeInOut',
                onUpdate: (v) => setIntroOffset(v),
                onComplete: () => {
                  setHasPlayedIntro(true);
                  sessionStorage.setItem(INTRO_PLAYED_KEY, 'true');
                },
              });
            },
          });
        }, 200);
        return () => clearTimeout(timer);
      } else {
        // Mark as played without animation for reduced motion
        sessionStorage.setItem(INTRO_PLAYED_KEY, 'true');
      }
    } catch (e) {
      // sessionStorage may not be available
      setHasPlayedIntro(true);
    }
  }, [reducedMotion]);

  const percent = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  // Get snap points within slider range
  const snapPointsInRange = useMemo(() => {
    if (!enableSnapPoints) return [];
    return getSnapPointsInRange(min, max);
  }, [min, max, enableSnapPoints]);

  // Check milestone crossing
  const checkMilestoneCrossing = useCallback((oldValue, newValue) => {
    for (const milestone of MILESTONES) {
      if (milestone >= min && milestone <= max) {
        const crossedForward = oldValue < milestone && newValue >= milestone;
        const crossedBackward = oldValue > milestone && newValue <= milestone;
        
        if ((crossedForward || crossedBackward) && lastMilestoneRef.current !== milestone) {
          lastMilestoneRef.current = milestone;
          haptics.pulse('milestone');
          
          if (!reducedMotion) {
            setMilestoneBump(true);
            setTimeout(() => setMilestoneBump(false), 150);
          }
          return;
        }
      }
    }
  }, [min, max, haptics, reducedMotion]);

  // Check min/max boundaries
  const checkBoundaries = useCallback((newValue) => {
    const isAtMin = newValue <= min;
    const isAtMax = newValue >= max;
    
    if (isAtMin && value !== min) {
      haptics.pulse('tap');
      if (!reducedMotion) {
        setEndBounce('min');
        setTimeout(() => setEndBounce(null), 150);
      }
    } else if (isAtMax && value !== max) {
      haptics.pulse('tap');
      if (!reducedMotion) {
        setEndBounce('max');
        setTimeout(() => setEndBounce(null), 150);
      }
    }
  }, [min, max, value, haptics, reducedMotion]);

  // Check for snap point proximity and trigger feedback
  const checkSnapFeedback = useCallback((newValue) => {
    if (!enableSnapPoints) return;

    const snapInfo = getNearestSnapPoint(newValue);
    
    if (snapInfo) {
      setActiveSnapPoint(snapInfo.snapPoint);
      
      // Trigger haptic when ENTERING a new snap zone
      if (lastSnapPointRef.current !== snapInfo.snapPoint) {
        haptics.pulse('milestone');
        // Visual pulse feedback
        setSnapPulse(true);
        setTimeout(() => setSnapPulse(false), 150);
        
        lastSnapPointRef.current = snapInfo.snapPoint;
      }
    } else {
      setActiveSnapPoint(null);
      lastSnapPointRef.current = null;
    }
  }, [enableSnapPoints, haptics]);

  const handleChange = (e) => {
    let newValue = parseInt(e.target.value, 10);
    if (isNaN(newValue)) return;

    if (!isDragging) {
      setIsDragging(true);
      if (onDragStart) onDragStart();
    }

    // Check milestone crossing
    checkMilestoneCrossing(value, newValue);
    
    // Check boundaries
    checkBoundaries(newValue);

    // Apply snap behavior (friction/nudge) when dragging
    if (enableSnapPoints && isDragging) {
      const snapResult = applySnapBehavior(value, newValue);
      newValue = snapResult.value;
    }

    // Check for snap feedback
    checkSnapFeedback(newValue);

    onChange({ target: { value: newValue } });
  };

  const handlePointerDown = () => {
    setIsDragging(true);
    dragStartTriggeredRef.current = false;
  };

  const handleDragStart = () => {
    if (!dragStartTriggeredRef.current) {
      dragStartTriggeredRef.current = true;
      // Trigger ink droplet on drag start
      setShowInkDroplet(true);
      setTimeout(() => setShowInkDroplet(false), 250);
    }
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      dragStartTriggeredRef.current = false;

      // Show ink dot animation on release if value changed
      if (Math.abs(value - lastValueRef.current) > 0) {
        setInkDotPosition(percent);
        setShowInkDot(true);
        setTimeout(() => setShowInkDot(false), 300);
      }

      // Snap haptic on release if near a snap point
      if (activeSnapPoint !== null) {
        haptics.pulse('snap');
      }

      lastValueRef.current = value;
      if (onDragEnd) onDragEnd();
    }
  };

  // Sync lastValueRef when value changes from outside
  useEffect(() => {
    if (!isDragging) {
      lastValueRef.current = value;
    }
  }, [value, isDragging]);

  // Theme-based outline color
  const getThumbOutlineColor = () => {
    return 'var(--accent-primary)';
  };

  // Calculate thumb animation state
  const getThumbTransform = () => {
    let scale = isDragging ? 1.08 : 1;
    if (milestoneBump && !reducedMotion) {
      scale = 1.12;
    }
    return scale;
  };

  // End bounce animation values
  const getEndBounceY = () => {
    if (!endBounce || reducedMotion) return 0;
    return -2;
  };

  return (
    <div className={`signature-slider signature-slider--${variant}`}>
      {/* Ghost signature path overlay */}
      <AnimatePresence>
        {showSignatureFlourish && (
          <GhostSignaturePath 
            show={showSignatureFlourish} 
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>

      {/* Root container */}
      <div
        ref={sliderRef}
        onMouseUp={handlePointerUp}
        onTouchEnd={handlePointerUp}
        onMouseLeave={handlePointerUp}
        style={{
          position: 'relative',
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          height: '52px',
        }}
      >
        {/* Track container */}
        <div
          style={{
            position: 'relative',
            flex: 1,
            height: '6px',
            borderRadius: '9999px',
            background: 'var(--slider-track, #e4e6ef)',
            marginLeft: '1.3rem',
            marginRight: '1.3rem',
          }}
        >
          {/* Range bar - visual progress */}
          <div
            style={{
              position: 'absolute',
              height: '100%',
              borderRadius: '9999px',
              background: 'var(--slider-fill, #4b7bf5)',
              width: `${percent}%`,
              boxShadow: '0 4px 12px -8px rgba(0, 0, 0, 0.28)',
            }}
          />

          {/* Snap point tick marks */}
          {enableSnapPoints && snapPointsInRange.map((snapPoint) => {
            const snapPercent = getSnapPointPercent(snapPoint, min, max);
            const isActive = activeSnapPoint === snapPoint;
            const isPassed = snapPercent <= percent;
            
            return (
              <div
                key={snapPoint}
                style={{
                  position: 'absolute',
                  left: `${snapPercent}%`,
                  top: '100%',
                  transform: 'translateX(-50%)',
                  width: '2px',
                  height: isActive ? '6px' : '4px',
                  marginTop: '4px',
                  backgroundColor: isActive 
                    ? '#00C7CF' 
                    : isPassed 
                      ? 'rgba(0, 199, 207, 0.5)' 
                      : 'rgba(180, 180, 180, 0.6)',
                  borderRadius: '1px',
                  transition: 'all 0.15s ease',
                  opacity: isActive && snapPulse ? 1 : 0.8,
                }}
              />
            );
          })}

          {/* Thumb with animations */}
          <motion.div
            style={{
              position: 'absolute',
              top: '50%',
              left: `${percent}%`,
              display: 'flex',
              height: thumbEmoji ? '24px' : '24px',
              width: thumbEmoji ? '24px' : '24px',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '9999px',
              border: thumbEmoji ? '0px solid transparent' : `1px solid ${getThumbOutlineColor()}`,
              backgroundColor: thumbEmoji ? 'transparent' : 'var(--bg-card-strong, #fff)',
              boxShadow: '0 10px 24px -16px rgba(7,11,24,0.45), 0 2px 8px -6px rgba(7,11,24,0.32)',
              pointerEvents: 'none',
              zIndex: 5,
            }}
            initial={{ x: '-50%', y: '-50%' }}
            animate={{
              x: `calc(-50% + ${introOffset}px + ${showSignatureFlourish && !reducedMotion ? '8px' : '0px'})`,
              y: `calc(-50% + ${getEndBounceY()}px)`,
              scale: getThumbTransform(),
            }}
            transition={{
              x: { duration: 0.2, ease: 'easeInOut' },
              y: { duration: 0.12, ease: 'easeOut' },
              scale: { duration: 0.15, ease: 'easeOut' },
            }}
          >
            {/* Ink droplet effect */}
            <InkDroplet show={showInkDroplet} reducedMotion={reducedMotion} />
            {thumbEmoji ? (
              <span
                style={{
                  fontSize: '20px',
                  lineHeight: 1,
                  userSelect: 'none',
                  filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.12))',
                }}
                aria-hidden="true"
              >
                {thumbEmoji}
              </span>
            ) : (
              <div
                style={{
                  height: '12px',
                  width: '12px',
                  borderRadius: '9999px',
                  background: 'var(--accent-primary)',
                  boxShadow: 'inset 0 0 0 2px #fff',
                }}
              />
            )}
          </motion.div>

          {/* Ink dot animation on release */}
          <div
            className={`signature-slider__ink-dot ${showInkDot ? 'signature-slider__ink-dot--active' : ''}`}
            style={{
              position: 'absolute',
              left: `${inkDotPosition}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        {/* Invisible range input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseDown={() => {
            handlePointerDown();
            handleDragStart();
          }}
          onTouchStart={() => {
            handlePointerDown();
            handleDragStart();
          }}
          aria-label={label || `Slider value: $${value.toLocaleString()}`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`$${value.toLocaleString()}`}
          style={{
            position: 'absolute',
            left: '1.3rem',
            right: '1.3rem',
            height: '48px',
            opacity: 0,
            cursor: isDragging ? 'grabbing' : 'grab',
            zIndex: 10,
          }}
        />
      </div>

      {/* Min/Max labels */}
      <div className="signature-slider__labels">
        <span className="signature-slider__label">${min / 1000}k</span>
        <span className="signature-slider__label">${max / 1000}k</span>
      </div>
    </div>
  );
}

export const SignatureSlider = React.memo(SignatureSliderComponent);
