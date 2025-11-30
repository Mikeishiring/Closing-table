/**
 * Candidate View
 * Where candidates respond to offers
 */

import React, { useState, useEffect } from 'react';
import { SignatureSlider } from '../components/SignatureSlider';
import { AnimatedSubmitButton } from '../components/AnimatedSubmitButton';
import { getOffer, generateResultLink } from '../lib/api';
import { formatCurrency } from '../lib/deal-math';
import { ResultCard } from '../components/ResultCard';

export function CandidateView({ offerId }) {
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [baseMin, setBaseMin] = useState(100000);
  const [equityMin, setEquityMin] = useState(0);
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
        
        setOffer(data);
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
      
      const response = await fetch(`http://localhost:3000/api/offers/${offerId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateBaseMin: baseMin,
          candidateEquityMin: offer.equityEnabled ? equityMin : 0,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit response');
      }
      
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
      <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-slate-900 mb-4" />
        <p className="text-slate-600">Loading offer...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Oops</h2>
        <p className="text-slate-600">{error}</p>
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

  const totalMin = baseMin + (offer.equityEnabled ? equityMin : 0);

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <h2 className="text-2xl font-semibold mb-2">Candidate View</h2>
      <p className="text-slate-600 mb-6">
        Enter your minimum acceptable offer. The company will never see this number.
      </p>

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

        {/* Equity */}
        {offer.equityEnabled && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Minimum Equity (Annual Value)
            </label>
            <div className="text-3xl font-bold mb-4">
              {formatCurrency(equityMin)}
            </div>
            <SignatureSlider
              value={equityMin}
              min={0}
              max={200000}
              step={5000}
              onChange={(e) => setEquityMin(Number(e.target.value))}
              variant="candidate"
              label="Candidate minimum equity"
            />
          </div>
        )}

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

      <div className="mt-6 p-4 bg-slate-50 rounded-lg text-sm text-slate-600">
        <p className="font-medium mb-1">🔒 How it works</p>
        <p>The mechanism will check if your minimum and the company's maximum overlap. If they do, it splits the difference 50/50.</p>
      </div>
    </div>
  );
}

