import React from 'react';

/**
 * Secondary info box shown to the right of the primary card.
 */
export function SecondaryInfoPanel({ title, items = [], className = '' }) {
  return (
    <aside className={`secondary-info ${className}`}>
      {title ? <p className="secondary-info__title">{title}</p> : null}
      {items.length ? (
        <ul className="secondary-info__list">
          {items.map((item) => (
            <li key={item} className="secondary-info__item">
              <span className="secondary-info__icon">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </aside>
  );
}

