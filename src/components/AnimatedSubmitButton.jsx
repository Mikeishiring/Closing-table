/**
 * AnimatedSubmitButton Component
 * Centralized animated button with lock/unlock icon
 * Enhanced with haptics and shake animation for errors
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio, useHaptics, useReducedMotion } from '../hooks';

/**
 * Lock Icon Component
 */
const LockIcon = ({ isLocked, className = '' }) => {
  return isLocked ? (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      <circle cx="12" cy="16" r="1"></circle>
    </svg>
  ) : (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
      <circle cx="12" cy="16" r="1"></circle>
    </svg>
  );
};

/**
 * Check Icon Component
 */
const CheckIcon = ({ className = '' }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
};

/**
 * Sealed Envelope Animation Component
 */
const SealedEnvelope = ({ show, reducedMotion, onComplete }) => {
  useEffect(() => {
    if (show) {
      // Auto-dismiss after animation completes
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  if (reducedMotion) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-2 text-sm text-teal-600 font-medium mt-3"
      >
        <span>✉️</span>
        <span>Offer link ready</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: 6, opacity: 0 }}
      animate={{ 
        y: 0, 
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2 text-sm text-teal-600 font-medium mt-3"
    >
      <motion.span
        animate={{
          x: [0, 0, 24],
          opacity: [1, 1, 0],
          scale: [1, 1.05, 0.95],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 1.2,
          times: [0, 0.5, 1],
          ease: 'easeInOut',
        }}
      >
        ✉️
      </motion.span>
      <motion.span
        animate={{
          opacity: [1, 1, 0],
        }}
        transition={{
          duration: 1.2,
          times: [0, 0.6, 1],
        }}
      >
        Offer link ready
      </motion.span>
    </motion.div>
  );
};

/**
 * Animated Submit Button
 * 
 * @param {Object} props
 * @param {Function} props.onClick - Click handler (can be async)
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {string} props.buttonText - Button text
 * @param {string} props.className - Additional classes
 * @param {boolean} props.hasError - Whether to show error shake
 * @param {Function} props.onSuccess - Callback when success animation completes
 * @param {Function} props.onError - Callback for error handling
 */
export function AnimatedSubmitButton({
  onClick,
  disabled = false,
  buttonText = 'Lock it in & Get Link',
  className = '',
  hasError = false,
  onSuccess,
  onError,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showEnvelope, setShowEnvelope] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  
  const { playClick, playSuccess } = useAudio();
  const haptics = useHaptics();
  const reducedMotion = useReducedMotion();

  // Handle external error state
  useEffect(() => {
    if (hasError) {
      triggerError();
    }
  }, [hasError]);

  const triggerError = useCallback(() => {
    haptics.pulse('error');
    if (!reducedMotion) {
      setShakeError(true);
      setTimeout(() => setShakeError(false), 250);
    }
    if (onError) onError();
  }, [haptics, reducedMotion, onError]);

  const handlePointerDown = () => {
    if (!disabled && !isClicked) {
      haptics.pulse('tap');
    }
  };

  const handleClick = async (e) => {
    if (disabled || isClicked) return;
    e.preventDefault();

    playClick();
    setIsClicked(true);

    try {
      // If onClick returns a promise, await it
      const result = onClick ? await onClick(e) : null;
      
      // Check if the result indicates an error
      if (result === false || (result && result.error)) {
        triggerError();
        setIsClicked(false);
        return;
      }

      // Success flow
      setTimeout(() => {
        setShowSuccess(true);
        playSuccess();
        haptics.pulse('confirm');
        
        // Show sealed envelope animation
        setShowEnvelope(true);
        
        if (onSuccess) onSuccess();
      }, 150);

      setTimeout(() => {
        setIsClicked(false);
        setShowSuccess(false);
      }, 1500);

    } catch (error) {
      triggerError();
      setIsClicked(false);
    }
  };

  const baseStyles =
    'w-full font-semibold py-4 px-6 rounded-full transition-all flex items-center justify-center gap-3 relative overflow-hidden cursor-pointer border-none outline-none';

  const getButtonStyles = () => {
    if (disabled) return 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50';
    if (showSuccess) return 'bg-[#34C759] text-white';
    return 'bg-[#00C4CC] text-white shadow-[0_4px_14px_rgba(0,196,204,0.35)]';
  };

  const buttonVariants = {
    initial: { scale: 1, y: 0, x: 0, boxShadow: '0 4px 14px rgba(0,196,204,0.35)' },
    hover: {
      y: -6,
      scale: 1.02,
      boxShadow: '0 12px 28px rgba(0,196,204,0.5)',
      transition: { type: 'spring', stiffness: 400, damping: 17 },
    },
    tap: {
      scale: 0.95,
      y: 0,
      transition: { type: 'spring', stiffness: 500, damping: 15 },
    },
    success: {
      scale: 1,
      borderRadius: '50%',
      width: '64px',
      height: '64px',
      transition: { duration: 0.3, ease: 'easeInOut' },
    },
    shake: {
      x: [-3, 3, -3, 3, 0],
      transition: { duration: 0.25, ease: 'easeInOut' },
    },
  };

  const iconVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.15,
      rotate: -8,
      transition: { type: 'spring', stiffness: 300, damping: 10 },
    },
    locked: {
      scale: 1,
      rotate: 0,
      transition: { type: 'spring', stiffness: 500, damping: 15 },
    },
  };

  const textVariants = {
    initial: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  const checkVariants = {
    initial: { scale: 0, opacity: 0, rotate: -180 },
    show: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
  };

  const getAnimateState = () => {
    if (shakeError && !reducedMotion) return 'shake';
    if (showSuccess) return 'success';
    if (isClicked) return 'tap';
    if (isHovered) return 'hover';
    return 'initial';
  };

  return (
    <div className="flex flex-col items-center">
      <motion.button
        className={`${baseStyles} ${getButtonStyles()} ${className}`}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        disabled={disabled}
        onHoverStart={() => !disabled && setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        variants={buttonVariants}
        initial="initial"
        animate={getAnimateState()}
        whileTap={!disabled && !isClicked ? 'tap' : undefined}
      >
        {showSuccess ? (
          <motion.div
            variants={checkVariants}
            initial="initial"
            animate="show"
            className="absolute inset-0 flex items-center justify-center"
          >
            <CheckIcon className="w-8 h-8" />
          </motion.div>
        ) : (
          <>
            <motion.div
              variants={iconVariants}
              initial="initial"
              animate={isHovered ? 'hover' : 'locked'}
              style={{ width: '20px', height: '20px' }}
            >
              <LockIcon isLocked={isHovered} className="w-full h-full" />
            </motion.div>
            <motion.span
              variants={textVariants}
              initial="initial"
              animate={isClicked ? 'exit' : 'initial'}
            >
              {buttonText}
            </motion.span>
          </>
        )}
        {isClicked && !showSuccess && (
          <motion.div
            className="absolute inset-0 bg-white rounded-full"
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ pointerEvents: 'none' }}
          />
        )}
      </motion.button>

      {/* Sealed Envelope Animation */}
      <AnimatePresence>
        {showEnvelope && (
          <SealedEnvelope
            show={showEnvelope}
            reducedMotion={reducedMotion}
            onComplete={() => setShowEnvelope(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
