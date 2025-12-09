/**
 * InitialsStamp Component
 * A decorative stamp animation that appears when both sides complete a deal
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHaptics, useReducedMotion } from '../hooks';

/**
 * Impact Ring - The expanding ring effect when stamp lands
 */
const ImpactRing = ({ show, reducedMotion }) => {
  if (!show || reducedMotion) return null;

  return (
    <motion.div
      className="absolute inset-0 rounded-full border-2 border-teal-400"
      initial={{ scale: 1, opacity: 0.6 }}
      animate={{ scale: 1.6, opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    />
  );
};

/**
 * Initials Stamp Component
 * 
 * @param {Object} props
 * @param {boolean} props.isDealComplete - Whether both sides have completed
 * @param {string} props.initials - Initials to display (default: "CT")
 * @param {string} props.className - Additional classes
 */
export function InitialsStamp({ 
  isDealComplete = false, 
  initials = 'CT',
  className = '' 
}) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showImpactRing, setShowImpactRing] = useState(false);
  const previousCompleteRef = useRef(false);
  
  const haptics = useHaptics();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // Only trigger animation when transitioning TO complete state
    if (isDealComplete && !previousCompleteRef.current && !hasAnimated) {
      setHasAnimated(true);
      
      // Trigger haptic feedback
      haptics.pulse('confirm');
      
      // Show impact ring
      if (!reducedMotion) {
        setShowImpactRing(true);
        setTimeout(() => setShowImpactRing(false), 400);
      }
    }
    
    previousCompleteRef.current = isDealComplete;
  }, [isDealComplete, hasAnimated, haptics, reducedMotion]);

  if (!isDealComplete) return null;

  const stampVariants = {
    initial: reducedMotion 
      ? { scale: 1, y: 0, opacity: 1 }
      : { scale: 0.5, y: -10, opacity: 0 },
    animate: reducedMotion
      ? { scale: 1, y: 0, opacity: 1 }
      : {
          scale: [0.5, 1.1, 1],
          y: [-10, 0, 0],
          opacity: 1,
          transition: {
            duration: 0.35,
            times: [0, 0.6, 1],
            ease: 'easeOut',
          },
        },
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`relative inline-flex items-center justify-center ${className}`}
        variants={stampVariants}
        initial="initial"
        animate="animate"
      >
        {/* Impact ring effect */}
        <ImpactRing show={showImpactRing} reducedMotion={reducedMotion} />
        
        {/* Main stamp circle */}
        <div
          className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-teal-400 shadow-sm"
          style={{
            boxShadow: '0 2px 8px rgba(0, 196, 204, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.8)',
          }}
        >
          {/* Initials text */}
          <span
            className="text-xs font-bold tracking-wide text-teal-600"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {initials}
          </span>
          
          {/* Subtle inner ring */}
          <div
            className="absolute inset-1 rounded-full border border-teal-200 opacity-50"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default InitialsStamp;


