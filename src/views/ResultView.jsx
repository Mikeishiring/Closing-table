/**
 * Result View
 * Fetches and displays negotiation outcome
 */

import React, { useState, useEffect } from 'react';
import { getResult } from '../api';
import { ResultCard } from '../components';
import { goHome } from '../routing';
import { PrimaryPanel } from '../components';
import { copy } from '../tokens';

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
          setError(copy.error.resultNotFound);
          return;
        }
        
        if (data.status === 'invalid') {
          setError(copy.error.invalidResult);
          return;
        }
        
        if (data.status === 'expired') {
          setError(copy.error.expiredResult);
          return;
        }
        
        setResult(data);
      } catch (err) {
        setError(err.message || copy.error.resultNotFound);
      } finally {
        setLoading(false);
      }
    }
    
    fetchResult();
  }, [resultId]);
  
  if (loading) {
    return (
      <PrimaryPanel className="space-y-6 animate-[cardIn_280ms_ease-out]">
        <div className="animate-pulse space-y-6">
          <div className="space-y-2 text-center">
            <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto" />
            <div className="h-4 bg-slate-100 rounded w-2/3 mx-auto" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-100 rounded w-1/4" />
            <div className="h-10 bg-slate-200 rounded w-full" />
            <div className="h-2 bg-slate-200 rounded-full w-full" />
          </div>
          <div className="h-12 bg-slate-200 rounded-full w-full" />
        </div>
      </PrimaryPanel>
    );
  }
  
  if (error) {
    return (
      <PrimaryPanel className="space-y-6 text-center animate-[cardIn_280ms_ease-out]">
        <div className="flex flex-col items-center space-y-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 ring-4 ring-rose-100 text-4xl text-rose-600 animate-[emojiPop_260ms_ease-out]">
            <span>⚠️</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
            {error === copy.error.resultNotFound ? copy.error.resultNotFoundHeadline :
             error === copy.error.expiredResult ? copy.error.resultExpiredHeadline :
             'Oops'}
          </h2>
          <p className="text-slate-600">{error}</p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={goHome}
            className="w-full rounded-full bg-slate-900 text-white py-3 text-sm font-medium hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 transition-all active:scale-[0.98]"
          >
            {copy.error.goHome}
          </button>
        </div>
      </PrimaryPanel>
    );
  }
  
  if (!result) {
    return null;
  }
  
  return (
    <ResultCard
      status={result.status}
      finalOffer={result.final}
      suggested={result.suggested}
    />
  );
}


