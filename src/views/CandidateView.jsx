/**
 * Candidate View
 * Where candidates respond to offers
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { PrimaryCard, PrimaryPanel, PrimarySlider, SlideToConfirm, ValueInputSection, ResultCard } from '../components';
import { getOffer, submitResponse } from '../api';
import { formatCurrency, LIMITS, parseMoneyInput, formatNumber } from '../lib/deal';
import { useFocusMode } from '../hooks';
import { goHome } from '../routing';
import { copy, EXPIRY } from '../tokens';

export function CandidateView({ offerId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalComp, setTotalComp] = useState(100000);
  const [totalInput, setTotalInput] = useState('100,000');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [isFocusing, setIsFocusing] = useState(false);
  const [formError, setFormError] = useState('');
  const offerAbortRef = useRef(null);
  const { enable: enableFocusMode, disable: disableFocusMode } = useFocusMode();

  useEffect(() => {
    async function fetchOffer() {
      try {
        setLoading(true);
        // Abort any in-flight request when offerId changes
        if (offerAbortRef.current) {
          offerAbortRef.current.abort();
        }
        const controller = new AbortController();
        offerAbortRef.current = controller;
        const data = await getOffer(offerId, { signal: controller.signal });
        
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
        if (err?.name === 'AbortError') return;
        setError(err.message || 'Failed to load offer');
      } finally {
        setLoading(false);
      }
    }
    
    fetchOffer();
    return () => {
      if (offerAbortRef.current) {
        offerAbortRef.current.abort();
      }
    };
  }, [offerId]);

  const handleTotalInputChange = useCallback((val) => {
    const { value, display } = parseMoneyInput(val, LIMITS);
    setTotalInput(display);
    setTotalComp(value);
    setFormError('');
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      setFormError('');
      
      const clampedTotal = Math.min(Math.max(totalComp, LIMITS.TOTAL_MIN), LIMITS.TOTAL_MAX);

      // Client-side validation for sanity
      if (clampedTotal < LIMITS.TOTAL_MIN || clampedTotal > LIMITS.TOTAL_MAX) {
        setFormError(`Please keep your minimum between ${formatCurrency(LIMITS.TOTAL_MIN)} and ${formatCurrency(LIMITS.TOTAL_MAX)}.`);
        return;
      }
      
      const data = await submitResponse(offerId, {
        min: clampedTotal,
      });

      // Store result in local state first (as backup)
      const resultData = {
        status: data.status,
        finalOffer: data.final,
        suggested: data.suggested,
      };
      setResult(resultData);

      // If we have a resultId, navigate to the result view
      if (data?.resultId) {
        // Small delay to ensure state is set before navigation
        setTimeout(() => {
          window.location.hash = `#result=${data.resultId}`;
        }, 100);
        return;
      }
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setFormError(err.message || 'We could not submit your response. Please retry.');
    } finally {
      setSubmitting(false);
    }
  }, [offerId, submitting, totalComp]);

  if (loading) {
    return (
      <PrimaryCard className="space-y-6 animate-[cardIn_280ms_ease-out]">
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
      </PrimaryCard>
    );
  }

  if (error) {
    return (
      <PrimaryCard className="space-y-6 animate-[cardIn_280ms_ease-out]">
        <header className="flex flex-col items-center text-center space-y-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 ring-4 ring-rose-100 text-4xl text-rose-600 animate-[emojiPop_260ms_ease-out]">
            <span>⚠️</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            {error === 'Offer not found' ? copy.error.notFoundHeadline : 
             error === 'Offer has expired' ? copy.error.expiredHeadline : 
             error === 'Invalid offer link' ? copy.error.invalidHeadline : 
             'Oops'}
          </h1>
          <p className="text-sm md:text-base text-slate-600">
            {error}
          </p>
        </header>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={goHome}
            className="w-full rounded-full bg-slate-900 text-white py-3 text-sm font-medium hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 transition-all active:scale-[0.98]"
          >
            {copy.error.retry}
          </button>
        </div>
      </PrimaryCard>
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

  return (
    <div className="page-grid">
      <PrimaryPanel
        className="animate-[cardIn_280ms_ease-out]"
        title={copy.candidate.headline}
        data-focus-mode={isFocusing}
      >
        <div className="card-flow">
          <ValueInputSection
            label={copy.candidate.valueLabel}
            inputValue={totalInput}
            onInputChange={handleTotalInputChange}
            onFocus={() => {
              setIsFocusing(true);
              enableFocusMode();
            }}
            onBlur={() => {
              setIsFocusing(false);
              disableFocusMode();
            }}
          />

          <PrimarySlider
            label={copy.candidate.sliderLabel}
            value={totalComp}
            min={LIMITS.TOTAL_MIN}
            max={LIMITS.TOTAL_MAX}
            step={5000}
            onChange={(e) => {
              const next = Number(e.target.value);
              setTotalComp(next);
              setTotalInput(formatNumber(next));
              setFormError('');
            }}
            variant="candidate"
            thumbEmoji="🪙"
            onDragStart={() => {
              setIsFocusing(true);
              enableFocusMode();
            }}
            onDragEnd={() => {
              setIsFocusing(false);
              disableFocusMode();
            }}
          />

          <section className="card-block">
            <div className="privacy-note">
              <span>{copy.candidate.privacy}</span>
            </div>
          </section>

          <section className="card-block card-block--cta">
            <div className="cta-stack">
              <SlideToConfirm
                text={copy.candidate.cta}
                onConfirm={handleSubmit}
                loading={submitting}
                disabled={submitting}
              />
              {formError && (
                <p className="cta-error" role="alert" aria-live="polite">
                  <span aria-hidden="true">⚠️</span>
                  <span>{formError}</span>
                </p>
              )}
            </div>
          </section>
        </div>
      </PrimaryPanel>
    </div>
  );
}
