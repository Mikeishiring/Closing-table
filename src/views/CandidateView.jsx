/**
 * Candidate View
 * Where candidates respond to offers
 */

import React, { useState, useEffect } from 'react';
import { SignatureSlider } from '../components/SignatureSlider';
import { AnimatedSubmitButton } from '../components/AnimatedSubmitButton';
import { getOffer, submitResponse } from '../lib/api';
import { formatCurrency, LIMITS } from '../lib/deal-math';
import { ResultCard } from '../components/ResultCard';

export function CandidateView({ offerId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [baseMin, setBaseMin] = useState(100000);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function fetchOffer() {
      try {
        setLoading(true);
        const data = await getOffer(offerId);
        
        if (!data) {
          setError('Offer not found');
          return;
        }
        
        if (data.status === 'invalid') {
          setError('Invalid offer link');
          return;
        }
        
        if (data.status === 'expired') {
          setError('Offer has expired');
          return;
        }
      } catch (err) {
        setError(err.message || 'Failed to load offer');
      } finally {
        setLoading(false);
      }
    }
    
    fetchOffer();
  }, [offerId]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Client-side validation for sanity
      if (baseMin < LIMITS.TOTAL_MIN || baseMin > LIMITS.TOTAL_MAX) {
        throw new Error(
          `Please keep your minimum between ${formatCurrency(LIMITS.TOTAL_MIN)} and ${formatCurrency(LIMITS.TOTAL_MAX)}.`
        );
      }
      
      const data = await submitResponse(offerId, {
        min: baseMin,
      });
      
      // Calculate gap percentage for display
      let gapPercent = null;
      if (data.status === 'close') {
        gapPercent = 8; // Approximate, within bridge zone
      } else if (data.status === 'fail') {
        gapPercent = 15; // Approximate, above bridge zone
      }
      
      setResult({
        status: data.status,
        finalOffer: data.final,
        suggested: data.suggested,
        gapPercent,
        resultId: data.resultId,
      });
    } catch (err) {
      alert('Error submitting response: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl animate-[cardIn_280ms_ease-out]">
        <div className="animate-pulse space-y-6">
          <div className="space-y-2">
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl animate-[cardIn_280ms_ease-out]">
        <header className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 ring-4 ring-rose-100 text-4xl text-rose-600 animate-[emojiPop_260ms_ease-out]">
            <span>⚠️</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            Oops
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-600">
            {error}
          </p>
        </header>
        
        <div className="mt-6">
          <button
            onClick={() => window.location.hash = ''}
            className="w-full rounded-full bg-slate-900 text-white py-3 text-sm font-medium hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 transition-all active:scale-[0.98]"
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <ResultCard
        status={result.status}
        finalOffer={result.finalOffer}
        suggested={result.suggested}
        gapPercent={result.gapPercent}
        resultId={result.resultId}
      />
    );
  }

  const totalMin = baseMin;

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl animate-[cardIn_280ms_ease-out]">
      <div className="inline-flex items-center justify-center px-3 py-1 mb-3 rounded-full bg-[#E6F9FA] text-xs font-medium text-[#007C80]">
        Candidate view
      </div>
      <h2 className="section-title mb-2">Candidate View</h2>
      <p className="section-lead mb-2">
        Enter your minimum acceptable offer. The company will never see this number.
      </p>

      {/* Privacy note */}
      <div className="mb-6 inline-flex items-center gap-2 text-sm text-[#555]">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>We only show the final number, never your inputs.</span>
      </div>

      {/* Progress header */}
      <div className="mb-6 flex items-center justify-center gap-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white font-semibold">
            ✓
          </div>
          <span className="font-medium text-emerald-600">Set Minimum</span>
        </div>
        <div className="h-px w-8 bg-emerald-500" />
        <div className="flex items-center gap-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white font-semibold">
            2
          </div>
          <span className="font-semibold text-slate-900">Submit</span>
        </div>
        <div className="h-px w-8 bg-slate-300" />
        <div className="flex items-center gap-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-500 font-semibold">
            3
          </div>
          <span className="text-slate-500">See Result</span>
        </div>
      </div>

      <div className="space-y-6 mb-8">
        {/* Base Salary */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Minimum Base Salary
          </label>
          <div className="text-3xl font-bold mb-4">
            {formatCurrency(baseMin)}
          </div>
          <SignatureSlider
            value={baseMin}
            min={50000}
            max={300000}
            step={5000}
            onChange={(e) => setBaseMin(Number(e.target.value))}
            variant="candidate"
            label="Candidate minimum base"
          />
        </div>

        {/* Total */}
        <div className="pt-4 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-700">Total Minimum</span>
            <span className="text-2xl font-bold text-slate-900">{formatCurrency(totalMin)}</span>
          </div>
        </div>
      </div>

      <AnimatedSubmitButton
        onClick={handleSubmit}
        buttonText="Lock it in & See Result"
        disabled={submitting}
      />
    </div>
  );
}
