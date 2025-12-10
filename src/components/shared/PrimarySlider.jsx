import React from 'react';
import { SignatureSlider } from '../SignatureSlider';

/**
 * Wrapper around SignatureSlider to enforce shared spacing + labels.
 */
export function PrimarySlider({ label, helper, ...sliderProps }) {
  return (
    <section className="primary-slider">
      {label ? <p className="primary-slider__label">{label}</p> : null}
      <SignatureSlider {...sliderProps} />
      {helper ? <p className="primary-slider__helper">{helper}</p> : null}
    </section>
  );
}

