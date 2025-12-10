/**
 * Candidate View
 * Where candidates respond to offers
 */

import React, { useState, useEffect } from 'react';
import { SignatureSlider } from '../components/SignatureSlider';
import { SlideToConfirm } from '../components/SlideToConfirm';
import { getOffer, submitResponse } from '../lib/api';
import { formatCurrency, LIMITS } from '../lib/deal-math';
import { ResultCard } from '../components/ResultCard';

export function CandidateView({ offerId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalComp, setTotalComp] = useState(100000);
  const [totalInput, setTotalInput] = useState('100,000');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [isFocusing, setIsFocusing] = useState(false);

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

  useEffect(() => {
    if (isFocusing) {
      document.body.classList.add('focus-mode');
    } else {
      document.body.classList.remove('focus-mode');
    }
    return () => document.body.classList.remove('focus-mode');
  }, [isFocusing]);

  const formatNumber = (value) => {
    if (!Number.isFinite(value)) return '';
    return value.toLocaleString('en-US');
  };

  const parseCurrencyInput = (raw) => {
    if (!raw) return 0;
    const str = raw.toString().trim().toLowerCase().replace(/[$,\s]/g, '');
    const multiplier = str.includes('m') ? 1_000_000 : str.includes('k') ? 1_000 : 1;
    const numeric = parseFloat(str.replace(/[km]/g, ''));
    if (Number.isNaN(numeric)) return 0;
    return Math.round(numeric * multiplier);
  };

  const handleTotalInputChange = (val) => {
    setTotalInput(val);
    const parsed = parseCurrencyInput(val);
    const clamped = Math.min(Math.max(parsed, LIMITS.TOTAL_MIN), LIMITS.TOTAL_MAX);
    setTotalComp(clamped);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      const clampedTotal = Math.min(Math.max(totalComp, LIMITS.TOTAL_MIN), LIMITS.TOTAL_MAX);

      // Client-side validation for sanity
      if (clampedTotal < LIMITS.TOTAL_MIN || clampedTotal > LIMITS.TOTAL_MAX) {
        throw new Error(
          `Please keep your minimum between ${formatCurrency(LIMITS.TOTAL_MIN)} and ${formatCurrency(LIMITS.TOTAL_MAX)}.`
        );
      }
      
      const data = await submitResponse(offerId, {
        min: clampedTotal,
      });
      
      setResult({
        status: data.status,
        finalOffer: data.final,
        suggested: data.suggested,
      });
    } catch (err) {
      alert('Error submitting response: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel space-y-6 animate-[cardIn_280ms_ease-out]">
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel space-y-6 animate-[cardIn_280ms_ease-out]">
        <header className="flex flex-col items-center text-center space-y-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 ring-4 ring-rose-100 text-4xl text-rose-600 animate-[emojiPop_260ms_ease-out]">
            <span>⚠️</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            Oops
          </h1>
          <p className="text-sm md:text-base text-slate-600">
            {error}
          </p>
        </header>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.location.hash = ''}
            className="w-full rounded-full bg-slate-900 text-white py-3 text-sm font-medium hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 transition-all active:scale-[0.98]"
          >
            Ask for a new link
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
      />
    );
  }

  const currentStep = 1;
  const steps = ['Set Number', 'See Result'];

  return (
    <div className="panel-with-side">
      <div className="glass-panel card-flow animate-[cardIn_280ms_ease-out] panel-main" data-focus-mode={isFocusing}>
        {/* Stepper */}
        <section className="card-block">
          <div className="flex items-center gap-2">
            {steps.map((label, idx) => {
              const stepIndex = idx + 1;
              const active = stepIndex <= currentStep;
              const isCurrent = stepIndex === currentStep;

              return (
                <div key={label} className="flex-1">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      active
                        ? 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 shadow-[0_6px_16px_-6px_rgba(14,165,233,0.6)]'
                        : 'bg-slate-200'
                    }`}
                  />
                  {isCurrent && (
                    <p className="mt-1 text-[11px] font-semibold text-slate-900 tracking-tight">
                      {label}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Hero number */}
        <section className="card-block text-center focus-priority">
          <p className="eyebrow">Total Compensation</p>
          <p className="text-5xl md:text-6xl font-semibold text-slate-900 tracking-tight">
            {formatCurrency(totalComp)}
          </p>
          <p className="microcopy quiet-text">
            One all-in number. Adjust and lock it in.
          </p>
        </section>

        {/* Inputs */}
        <section className="card-block focus-priority">
          <div className="flex items-center justify-between text-sm">
            <span className="input-label">Minimum total compensation</span>
            <span className="value-chip">{formatCurrency(totalComp)}</span>
          </div>
          <div className="relative">
            <div className="currency-prefix">$</div>
            <input
              className="currency-input"
              value={totalInput}
              onFocus={() => setIsFocusing(true)}
              onBlur={() => setIsFocusing(false)}
              onChange={(e) => handleTotalInputChange(e.target.value)}
              inputMode="numeric"
              aria-label="Total compensation"
            />
          </div>
          <SignatureSlider
            value={totalComp}
            min={LIMITS.TOTAL_MIN}
            max={LIMITS.TOTAL_MAX}
            step={5000}
            onChange={(e) => {
              const next = Number(e.target.value);
              setTotalComp(next);
              setTotalInput(formatNumber(next));
            }}
            variant="candidate"
            label="Candidate minimum total compensation"
            thumbEmoji="🪙"
            onDragStart={() => setIsFocusing(true)}
            onDragEnd={() => setIsFocusing(false)}
          />
        </section>

        {/* Privacy note */}
        <section className="card-block dim-when-unfocused">
          <div className="privacy-note">
            <span>🔐</span>
            <span>Single-use link; expires in 24 hours. We delete your inputs after the run.</span>
          </div>
        </section>

        <section className="card-block card-block--cta">
          <SlideToConfirm
            text="Slide to Lock Offer"
            onConfirm={handleSubmit}
            loading={submitting}
            disabled={submitting}
          />
          <p className="microcopy quiet-text cta-hint dim-when-unfocused">
            You can adjust before locking; this will notify the company once submitted.
          </p>
        </section>
      </div>

      <aside className="mini-widget mini-widget--side dim-when-unfocused">
        <p className="mini-widget__title">Your single number</p>
        <p className="mini-widget__body">Set the all-in comp you need; we reveal only the final match.</p>
      </aside>
    </div>
  );
}
