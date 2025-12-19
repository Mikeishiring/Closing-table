/**
 * Company View
 * Where companies set their maximum offer
 */

import React, { useCallback, useMemo, useState } from 'react';
import { PrimaryCard, PrimaryPanel, PrimarySlider, SecondaryPanel, SlideToConfirm, ValueInputSection } from '../components';
import { createOffer, generateOfferLink, copyToClipboard } from '../api';
import { LIMITS, parseMoneyInput, formatNumber } from '../lib/deal';
import { useFocusMode } from '../hooks';
import { copy, EXPIRY } from '../tokens';

export function CompanyView() {
  const [totalMax, setTotalMax] = useState(120000);
  const [totalInput, setTotalInput] = useState('120,000');
  const [offerLink, setOfferLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFocusing, setIsFocusing] = useState(false);
  const [formError, setFormError] = useState('');
  const { enable: enableFocusMode, disable: disableFocusMode } = useFocusMode();

  const resetForm = useCallback(() => {
    setOfferLink(null);
    setTotalMax(120000);
    setTotalInput('120,000');
    setFormError('');
  }, []);

  const handleSubmit = useCallback(async () => {
    if (loading) return;
    try {
      setLoading(true);
      setFormError('');
      const response = await createOffer({
        max: totalMax,
      });
      
      const link = generateOfferLink(response.offerId);
      setOfferLink(link);
    } catch (error) {
      setFormError(error.message || 'We could not create this offer. Please retry.');
    } finally {
      setLoading(false);
    }
  }, [loading, totalMax]);

  const handleCopyLink = useCallback(async () => {
    if (!offerLink) return;
    const result = await copyToClipboard(offerLink);
    if (result.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [offerLink]);

  const handleTotalInputChange = useCallback((val) => {
    const { value, display } = parseMoneyInput(val, LIMITS);
    setTotalInput(display);
    setTotalMax(value);
    setFormError('');
  }, []);

  if (offerLink) {
    return (
      <PrimaryCard className="animate-[cardIn_280ms_ease-out]" data-focus-mode={isFocusing}>
        <div className="card-flow">
          <header className="flex flex-col items-center text-center space-y-3">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-sky-500 text-white shadow-[0_20px_40px_-12px_rgba(14,165,233,0.55)] animate-[emojiPop_260ms_ease-out]">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-extrabold text-slate-900">
              {copy.company.linkReady.headline}
            </h1>
            
            <p className="text-base text-slate-600 max-w-sm">
              {copy.company.linkReady.subtitle}
            </p>
          </header>
          
          <main className="space-y-4">
            <section className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                {copy.company.linkReady.linkLabel}
              </p>
              <div className="relative flex items-center rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs md:text-sm text-slate-800 font-mono">
                <span className="break-all pr-12">{offerLink}</span>
                <button
                  onClick={handleCopyLink}
                  className="absolute right-2 inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-100 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2" />
                  </svg>
                  {copied ? copy.company.linkReady.copied : copy.company.linkReady.copy}
                </button>
              </div>
              <p className="text-sm text-slate-500">
                {copy.company.linkReady.explanation}
              </p>
            </section>
          </main>
          
          <div className="flex flex-col gap-3 focus-priority">
            <button
              onClick={() => window.open(offerLink, '_blank', 'noopener')}
              className="w-full rounded-full bg-slate-900 text-white py-3 text-sm font-semibold hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 transition-all active:scale-[0.98]"
            >
              {copy.company.linkReady.open}
            </button>

            <button onClick={resetForm} className="w-full text-sm font-semibold text-slate-700 hover:underline py-2">
              {copy.company.linkReady.createNew}
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-[12px] text-slate-500">
            <span>{copy.company.linkReady.expiryNote}</span>
          </div>
        </div>
      </PrimaryCard>
    );
  }

  return (
    <div className="page-grid">
      <PrimaryPanel
        className="animate-[cardIn_280ms_ease-out]"
        title={copy.company.title}
        subtitle={copy.company.subtitle}
        data-focus-mode={isFocusing}
      >
        <div className="card-flow">
          <ValueInputSection
            label={copy.company.form.label}
            inputValue={totalInput}
            placeholder="120,000"
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
            label={copy.company.form.inputAria}
            value={totalMax}
            min={LIMITS.TOTAL_MIN}
            max={LIMITS.TOTAL_MAX}
            step={5000}
            onChange={(e) => {
              const next = Number(e.target.value);
              setTotalMax(next);
              setTotalInput(formatNumber(next));
              setFormError('');
            }}
            variant="company"
            enableSnapPoints={false}
            thumbEmoji={null}
            onDragStart={() => {
              setIsFocusing(true);
              enableFocusMode();
            }}
            onDragEnd={() => {
              setIsFocusing(false);
              disableFocusMode();
            }}
          />

          <section className="card-block card-block--cta">
            <div className="cta-stack">
              <SlideToConfirm
                text={copy.company.form.cta}
                onConfirm={handleSubmit}
                loading={loading}
                disabled={loading}
              />
              {formError ? (
                <p className="cta-error" role="alert" aria-live="polite">
                  <span aria-hidden="true">⚠️</span>
                  <span>{formError}</span>
                </p>
              ) : (
                <div className="privacy-note" aria-live="polite">
                  <span>{copy.company.privacyNote}</span>
                </div>
              )}
            </div>
          </section>
        </div>
      </PrimaryPanel>

      <SecondaryPanel
        title={copy.company.howItWorks.title}
        items={copy.company.howItWorks.steps}
      />
    </div>
  );
}

