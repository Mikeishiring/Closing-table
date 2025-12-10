import React, { useRef } from 'react';

/**
 * Big editable currency display (Apple Pay style).
 */
export function MoneyNumber({
  value,
  onChange,
  onFocus,
  onBlur,
  prefix = '$',
  ariaLabel = 'Amount',
}) {
  const inputRef = useRef(null);

  return (
    <div className="money-number" onClick={() => inputRef.current?.focus()}>
      {prefix ? <span className="money-number__prefix">{prefix}</span> : null}
      <input
        ref={inputRef}
        className="money-number__input"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        inputMode="numeric"
        aria-label={ariaLabel}
      />
    </div>
  );
}

