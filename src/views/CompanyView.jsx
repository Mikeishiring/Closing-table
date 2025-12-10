/**
 * Company View
 * Where companies set their maximum offer
 */

import React, { useState, useEffect } from 'react';
import { SignatureSlider } from '../components/SignatureSlider';
import { SlideToConfirm } from '../components/SlideToConfirm';
import { createOffer, generateOfferLink, copyToClipboard } from '../lib/api';
import { formatCurrency, LIMITS } from '../lib/deal-math';

export function CompanyView() {
  const [totalMax, setTotalMax] = useState(120000);
  const [totalInput, setTotalInput] = useState('120,000');
  const [offerLink, setOfferLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFocusing, setIsFocusing] = useState(false);

  useEffect(() => {
    if (isFocusing) {
      document.body.classList.add('focus-mode');
    } else {
      document.body.classList.remove('focus-mode');
    }
    return () => document.body.classList.remove('focus-mode');
  }, [isFocusing]);

  const parseCurrencyInput = (raw) => {
    if (!raw) return 0;
    const str = raw.toString().trim().toLowerCase().replace(/[$,\s]/g, '');
    const multiplier = str.includes('m') ? 1_000_000 : str.includes('k') ? 1_000 : 1;
    const numeric = parseFloat(str.replace(/[km]/g, ''));
    if (Number.isNaN(numeric)) return 0;
    return Math.round(numeric * multiplier);
  };

  const formatNumber = (value) => {
    if (!Number.isFinite(value)) return '';
    return value.toLocaleString('en-US');
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await createOffer({
        max: totalMax,
      });
      
      const link = generateOfferLink(response.offerId);
      setOfferLink(link);
    } catch (error) {
      alert('Error creating offer: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    const result = await copyToClipboard(offerLink);
    if (result.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTotalInputChange = (val) => {
    setTotalInput(val);
    const parsed = parseCurrencyInput(val);
    const clamped = Math.min(Math.max(parsed, LIMITS.TOTAL_MIN), LIMITS.TOTAL_MAX);
    setTotalMax(clamped);
  };

  if (offerLink) {
    return (
      <div className="glass-panel card-flow animate-[cardIn_280ms_ease-out]" data-focus-mode={isFocusing}>
        {/* Hero: Big icon + headline */}
        <header className="flex flex-col items-center text-center space-y-3 dim-when-unfocused">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-sky-500 text-white shadow-[0_20px_40px_-12px_rgba(14,165,233,0.55)] animate-[emojiPop_260ms_ease-out]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-extrabold text-slate-900">
            Link ready
          </h1>
          
          <p className="text-base text-slate-600 max-w-sm">
            Works once and expires in 24 hours. This is the handshake—keep it handy.
          </p>
        </header>
        
        {/* Details: The link */}
        <main className="space-y-4">
          <section className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Shareable link
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
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-sm text-slate-500">
              Preview or paste it in a note. The candidate sees only the final outcome.
            </p>
          </section>
        </main>
        
        {/* Actions */}
        <div className="flex flex-col gap-3 focus-priority">
          <button
            onClick={() => window.open(offerLink, '_blank', 'noopener')}
            className="w-full rounded-full bg-slate-900 text-white py-3 text-sm font-semibold hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 transition-all active:scale-[0.98]"
          >
            Open link
          </button>

          <button
            onClick={() => {
              setOfferLink(null);
              setTotalMax(120000);
              setTotalInput('120,000');
            }}
            className="w-full text-sm font-semibold text-slate-700 hover:underline py-2"
          >
            New offer
          </button>
        </div>
        
        {/* Privacy hint */}
        <div className="flex items-center justify-center gap-2 text-[12px] text-slate-500">
          <span>🔐</span>
          <span>Your max is deleted after the run; only the outcome stays.</span>
        </div>
        
      </div>
    );
  }

  return (
    <div className="panel-with-side">
      <div className="glass-panel card-flow animate-[cardIn_280ms_ease-out] panel-main" data-focus-mode={isFocusing}>
        <section className="card-block dim-when-unfocused">
          <p className="eyebrow">Offer setup</p>
          <h2 className="section-title">Set your ceiling. Send one link.</h2>
          <p className="section-lead quiet-text">
            One-time, 24h link. Only the final outcome is shown.
          </p>
          <div className="privacy-note">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>We delete your max after the run; only the result is shown.</span>
          </div>
        </section>

        {/* Total Compensation */}
        <section className="card-block focus-priority">
          <label className="input-label">
            Maximum total compensation
          </label>
          <div className="relative">
            <div className="currency-prefix">$</div>
            <input
              className="hero-currency-input"
              value={totalInput}
              onFocus={() => setIsFocusing(true)}
              onBlur={() => setIsFocusing(false)}
              onChange={(e) => handleTotalInputChange(e.target.value)}
              inputMode="numeric"
              aria-label="Maximum total compensation"
            />
          </div>
        </section>

        {/* Slider */}
        <section className="card-block focus-priority">
          <div className="flex items-center justify-between">
            <span className="quiet-text text-sm font-semibold">Fine-tune with slider</span>
            <span className="value-chip">{formatCurrency(totalMax)}</span>
          </div>
          <SignatureSlider
            value={totalMax}
            min={LIMITS.TOTAL_MIN}
            max={LIMITS.TOTAL_MAX}
            step={5000}
            onChange={(e) => {
              const next = Number(e.target.value);
              setTotalMax(next);
              setTotalInput(formatNumber(next));
            }}
            variant="company"
            label="Company maximum total compensation"
            thumbEmoji="🪙"
            onDragStart={() => setIsFocusing(true)}
            onDragEnd={() => setIsFocusing(false)}
          />
        </section>

        <section className="card-block card-block--cta">
          <SlideToConfirm
            text="Slide to Lock Offer"
            onConfirm={handleSubmit}
            loading={loading}
            disabled={loading}
          />
          <p className="microcopy quiet-text cta-hint dim-when-unfocused">
            Works once and expires in 24 hours. We delete your max after the run.
          </p>
        </section>
      </div>

      <aside className="mini-widget mini-widget--side dim-when-unfocused">
        <p className="mini-widget__title">Private, single-use link</p>
        <p className="mini-widget__body">Share your ceiling once—only the final outcome is visible.</p>
      </aside>
    </div>
  );
}

