import React from 'react';
import { MoneyNumber } from './MoneyNumber';

/**
 * Shared section for currency input + headline value.
 */
export function ValueInputSection({
  label,
  displayValue,
  inputValue,
  onInputChange,
  onFocus,
  onBlur,
  prefix = '$',
  helper,
  placeholder,
  inputMode = 'numeric',
  id,
  displayAsInput = true,
}) {
  return (
    <section className="value-section">
      {label ? <p className="value-section__label">{label}</p> : null}

      {displayAsInput ? (
        <MoneyNumber
          value={inputValue ?? displayValue}
          onChange={onInputChange}
          onFocus={onFocus}
          onBlur={onBlur}
          prefix={prefix}
          ariaLabel={label}
        />
      ) : (
        <>
          {displayValue ? <div className="value-section__display">{displayValue}</div> : null}
          <div className="value-input">
            {prefix ? <span className="value-input__prefix">{prefix}</span> : null}
            <input
              id={id}
              className="value-input__field"
              value={inputValue}
              placeholder={placeholder}
              onFocus={onFocus}
              onBlur={onBlur}
              onChange={(e) => onInputChange?.(e.target.value)}
              inputMode={inputMode}
              aria-label={label}
            />
          </div>
        </>
      )}

      {helper ? <p className="value-section__helper">{helper}</p> : null}
    </section>
  );
}

