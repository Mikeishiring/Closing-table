/**
 * Result View
 * Fetches and displays negotiation outcome
 */

import React, { useState, useEffect } from 'react';
import { getResult } from '../lib/api';
import { ResultCard } from '../components/ResultCard';

export function ResultView({ resultId }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchResult() {
      try {
        setLoading(true);
        const data = await getResult(resultId);
        
        if (!data) {
          setError('Result not found');
          return;
        }
        
        if (data.status === 'invalid') {
          setError('Invalid result link');
          return;
        }
        
        if (data.status === 'expired') {
          setError('Result has expired');
          return;
        }
        
        setResult(data);
      } catch (err) {
        setError(err.message || 'Failed to load result');
      } finally {
        setLoading(false);
      }
    }
    
    fetchResult();
  }, [resultId]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-slate-900 mb-4" />
          <p className="text-slate-600">Loading result...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-lg text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Oops</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.hash = ''}
            className="bg-slate-900 text-white py-2 px-6 rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Go to home
          </button>
        </div>
      </div>
    );
  }
  
  if (!result) {
    return null;
  }
  
  // Calculate gap percentage if applicable
  let gapPercent = null;
  if (result.status === 'close' && result.suggested) {
    // Estimate gap from suggested midpoint
    // This is approximate since we don't have the original values
    gapPercent = 8; // Within bridge zone (< 10%)
  } else if (result.status === 'fail') {
    gapPercent = 15; // Above bridge zone
  }
  
  return (
    <ResultCard
      status={result.status}
      finalOffer={result.final}
      suggested={result.suggested}
      gapPercent={gapPercent}
      resultId={resultId}
    />
  );
}

