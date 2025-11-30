/**
 * SignatureSlider Component
 * Custom slider with pen emoji thumb - FIXED coordinate system
 */

import React, { useState, useRef, useEffect } from 'react';

/**
 * Reusable slider thumb with pen emoji
 * Size increased by 30% (twice - 69% total increase from original)
 */
export const SalarySliderThumb = () => (
  <span
    style={{
      fontSize: '23px', // was 18px, now 23px (30% increase again: 18 * 1.3 = 23.4)
      lineHeight: 0,
      transform: 'rotate(-25deg) translateY(1.7px)', // adjusted for larger size
      userSelect: 'none',
      display: 'inline-block',
    }}
  >
    ✒️
  </span>
);

/**
 * Signature Slider with perfect centering
 * KEY FIX: Thumb is positioned INSIDE track container, not as sibling
 */
export function SignatureSlider({
  value,
  min,
  max,
  step = 1000,
  onChange,
  variant = 'company',
  label,
  onDragStart,
  onDragEnd,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [showInkDot, setShowInkDot] = useState(false);
  const [inkDotPosition, setInkDotPosition] = useState(0);
  const lastValueRef = useRef(value);
  const sliderRef = useRef(null);

  const percent = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const handleChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    if (isNaN(newValue)) return;

    if (!isDragging) {
      setIsDragging(true);
      if (onDragStart) onDragStart();
    }

    onChange({ target: { value: newValue } });
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);

      // Show ink dot animation on release if value changed
      if (Math.abs(value - lastValueRef.current) > 0) {
        setInkDotPosition(percent);
        setShowInkDot(true);
        setTimeout(() => setShowInkDot(false), 300);
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

  return (
    <div className={`signature-slider signature-slider--${variant}`}>
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
          height: '57px', // was 44px, now 57px (30% increase)
        }}
      >
        {/* Track container = coordinate system for thumb AND range */}
        {/* This is the FIX: thumb is now a CHILD of track, not sibling */}
        <div
          style={{
            position: 'relative',
            flex: 1,
            height: '4px', // was 3px, now 4px (30% increase, rounded)
            borderRadius: '9999px',
            backgroundColor: '#dedede',
            marginLeft: '1.3rem', // was 1rem, now 1.3rem (30% increase)
            marginRight: '1.3rem',
          }}
        >
          {/* Range bar - visual progress */}
          <div
            style={{
              position: 'absolute',
              height: '100%',
              borderRadius: '9999px',
              backgroundColor: '#dedede',
              width: `${percent}%`,
            }}
          />

          {/* Thumb - NOW INSIDE track, same coordinate system */}
          {/* At 0%, thumb center is at track's left edge */}
          {/* At 100%, thumb center is at track's right edge */}
          {/* Perfect alignment at all positions! */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: `${percent}%`,
              transform: `translate(-50%, -50%) ${isDragging ? 'scale(1.08)' : 'scale(1)'}`,
              display: 'flex',
              height: '2.6rem', // was 2rem, now 2.6rem (30% increase)
              width: '2.6rem',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '9999px',
              border: '2.6px solid #00C7CF', // was 2px, now 2.6px (30% increase)
              backgroundColor: 'white',
              boxShadow: isDragging
                ? '0 13px 19px -4px rgba(0, 0, 0, 0.1), 0 5px 8px -3px rgba(0, 0, 0, 0.05)' // 30% increase
                : '0 5px 8px -1px rgba(0, 0, 0, 0.1), 0 3px 5px -1px rgba(0, 0, 0, 0.06)', // 30% increase
              pointerEvents: 'none',
              transition: 'all 0.15s ease',
              zIndex: 5,
            }}
          >
            <SalarySliderThumb />
          </div>

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

        {/* Invisible range input - aligned with track margins */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
          aria-label={label || `Slider value: $${value.toLocaleString()}`}
          style={{
            position: 'absolute',
            left: '1.3rem', // was 1rem, now 1.3rem (30% increase)
            right: '1.3rem',
            height: '57px', // was 44px, now 57px (30% increase)
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

