/**
 * Company View
 * Where companies set their maximum offer
 */

import React, { useState } from 'react';
import { SignatureSlider } from '../components/SignatureSlider';
import { AnimatedSubmitButton } from '../components/AnimatedSubmitButton';
import { createOffer, generateOfferLink, copyToClipboard } from '../lib/api';
import { formatCurrency } from '../lib/deal-math';

export function CompanyView() {
  const [baseMax, setBaseMax] = useState(120000);
  const [equityMax, setEquityMax] = useState(30000);
  const [equityEnabled, setEquityEnabled] = useState(true);
  const [offerLink, setOfferLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalMax = baseMax + (equityEnabled ? equityMax : 0);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await createOffer({
        companyBaseMax: baseMax,
        companyEquityMax: equityEnabled ? equityMax : 0,
        equityEnabled,
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

  if (offerLink) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 animate-[cardIn_280ms_ease-out]">
        
        {/* Hero: Big emoji + headline */}
        <header className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 md:h-18 md:w-18 items-center justify-center rounded-full bg-slate-50 ring-4 ring-emerald-100 text-4xl md:text-5xl text-emerald-600 animate-[emojiPop_260ms_ease-out]">
            <span>🔗</span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            Offer Created
          </h1>
          
          <p className="mt-2 text-sm md:text-base text-slate-600 max-w-sm">
            Share this link with your candidate. It works once and expires in 24 hours.
          </p>
        </header>

        {/* Details: The link */}
        <main className="mt-6 space-y-4">
          <section className="text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-3">
              Shareable Link
            </p>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs md:text-sm text-slate-700 break-all font-mono border border-slate-200">
              {offerLink}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Click below to copy this link to your clipboard
            </p>
          </section>
        </main>

        {/* Actions: Buttons */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleCopyLink}
            className="w-full rounded-full bg-slate-900 text-white py-3 text-sm font-medium hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 transition-all active:scale-[0.98]"
          >
            {copied ? 'Copied ✓' : 'Copy Link'}
          </button>
          
          <button
            onClick={() => {
              setOfferLink(null);
              setBaseMax(120000);
              setEquityMax(30000);
            }}
            className="w-full rounded-full border border-slate-200 py-3 text-sm text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 transition-all active:scale-[0.98]"
          >
            Create Another Offer 🔁
          </button>
        </div>
        
        {/* Privacy hint */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <span>🔐</span>
          <span>Your maximum stays private until the mechanism runs</span>
        </div>
        
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl animate-[cardIn_280ms_ease-out]">
      <div className="inline-flex items-center justify-center px-3 py-1 mb-3 rounded-full bg-[#E6F9FA] text-xs font-medium text-[#007C80]">
        Company view
      </div>
      <h2 className="text-2xl font-semibold mb-2">Company View</h2>
      <p className="text-slate-600 mb-2">
        Set your maximum offer. The candidate will never see this number.
      </p>

      {/* Privacy note */}
      <div className="mb-6 inline-flex items-center gap-2 text-sm text-[#555]">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>We only show the final number, never your inputs.</span>
      </div>

      <div className="space-y-6 mb-8">
        {/* Base Salary */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Maximum Base Salary
          </label>
          <div className="text-3xl font-bold mb-4">
            {formatCurrency(baseMax)}
          </div>
          <SignatureSlider
            value={baseMax}
            min={50000}
            max={300000}
            step={5000}
            onChange={(e) => setBaseMax(Number(e.target.value))}
            variant="company"
            label="Company maximum base"
          />
        </div>

        {/* Equity Toggle */}
        <div className="flex items-center justify-between py-4 border-t border-slate-200">
          <div>
            <label className="font-medium text-slate-900">Include Equity?</label>
            <p className="text-sm text-slate-500">Add equity component to the offer</p>
          </div>
          <button
            onClick={() => setEquityEnabled(!equityEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              equityEnabled ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                equityEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Equity */}
        {equityEnabled && (
          <div className="animate-slideDown">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Maximum Equity (Annual Value)
            </label>
            <div className="text-3xl font-bold mb-4">
              {formatCurrency(equityMax)}
            </div>
            <SignatureSlider
              value={equityMax}
              min={0}
              max={200000}
              step={5000}
              onChange={(e) => setEquityMax(Number(e.target.value))}
              variant="company"
              label="Company maximum equity"
            />
          </div>
        )}

        {/* Total */}
        <div className="pt-4 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-700">Total Maximum</span>
            <span className="text-2xl font-bold text-slate-900">{formatCurrency(totalMax)}</span>
          </div>
        </div>
      </div>

      <AnimatedSubmitButton
        onClick={handleSubmit}
        buttonText="Lock it in & Get Link"
        disabled={loading}
      />
    </div>
  );
}

