import React from 'react';

/**
 * Wraps pages with the aurora gradient background and centers content.
 */
export function LayoutShell({ children }) {
  return (
    <div className="aurora-shell">
      <div className="layout-shell">
        <div className="app-brand">The Closing Table</div>
        <div className="page-shell">{children}</div>
      </div>
    </div>
  );
}

