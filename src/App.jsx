/**
 * Main App Component
 * Hash-based routing between Company, Candidate, and Result views
 */

import React, { Suspense } from 'react';
import { useHashRoute } from './hooks';

// Lazy load views for better performance
const CompanyView = React.lazy(() => import('./views/CompanyView').then(m => ({ default: m.CompanyView })));
const CandidateView = React.lazy(() => import('./views/CandidateView').then(m => ({ default: m.CandidateView })));
const ResultView = React.lazy(() => import('./views/ResultView').then(m => ({ default: m.ResultView })));

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="glass-panel">
      <div className="animate-pulse space-y-6">
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-100 rounded w-2/3" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-100 rounded w-1/4" />
          <div className="h-10 bg-slate-200 rounded w-full" />
          <div className="h-2 bg-slate-200 rounded-full w-full" />
        </div>
        <div className="h-12 bg-slate-200 rounded-lg w-full" />
      </div>
    </div>
  );
}

function App() {
  const route = useHashRoute();

  return (
    <div className="aurora-shell flex items-center justify-center p-4">
      <div className="relative max-w-4xl w-full z-10 flex flex-col items-center">
        <h1 className="app-title dim-when-unfocused">
          The Closing Table
        </h1>

        <Suspense fallback={<LoadingFallback />}>
          {route.type === 'result' ? (
            <ResultView resultId={route.id} />
          ) : route.type === 'offer' ? (
            <CandidateView offerId={route.id} />
          ) : (
            <CompanyView />
          )}
        </Suspense>
      </div>
    </div>
  );
}

export default App;
