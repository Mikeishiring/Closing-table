/**
 * AnimatedSubmitButton Component
 * Centralized animated button with lock/unlock icon
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '../hooks';

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
 * Animated Submit Button
 */
export function AnimatedSubmitButton({
  onClick,
  disabled = false,
  buttonText = 'Lock it in & Get Link',
  className = '',
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { playClick, playSuccess } = useAudio();

  const handleClick = async (e) => {
    if (disabled || isClicked) return;
    e.preventDefault();

    playClick();
    setIsClicked(true);

    setTimeout(() => {
      setShowSuccess(true);
      playSuccess();
    }, 150);

    setTimeout(() => {
      if (onClick) onClick(e);
    }, 650);

    setTimeout(() => {
      setIsClicked(false);
      setShowSuccess(false);
    }, 1500);
  };

  const baseStyles =
    'w-full font-semibold py-4 px-6 rounded-full transition-all flex items-center justify-center gap-3 relative overflow-hidden cursor-pointer border-none outline-none';

  const getButtonStyles = () => {
    if (disabled) return 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50';
    if (showSuccess) return 'bg-[#34C759] text-white';
    return 'bg-[#00C4CC] text-white shadow-[0_4px_14px_rgba(0,196,204,0.35)]';
  };

  const buttonVariants = {
    initial: { scale: 1, y: 0, boxShadow: '0 4px 14px rgba(0,196,204,0.35)' },
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

  return (
    <motion.button
      className={`${baseStyles} ${getButtonStyles()} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      onHoverStart={() => !disabled && setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      variants={buttonVariants}
      initial="initial"
      animate={
        showSuccess ? 'success' : isClicked ? 'tap' : isHovered ? 'hover' : 'initial'
      }
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
  );
}

