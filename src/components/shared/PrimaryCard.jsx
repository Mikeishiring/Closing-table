import React from 'react';

/**
 * Core frosted card used across the three pages.
 */
export function PrimaryCard({ title, subtitle, children, className = '', ...rest }) {
  return (
    <section className={`primary-card ${className}`} {...rest}>
      {(title || subtitle) && (
        <header className="primary-card__head">
          {title ? <h1 className="primary-card__title">{title}</h1> : null}
          {subtitle ? <p className="primary-card__subtitle">{subtitle}</p> : null}
        </header>
      )}
      <div className="primary-card__body">{children}</div>
    </section>
  );
}

