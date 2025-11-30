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
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Offer Created</h2>
          <p className="text-slate-600">Share this link with your candidate</p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 mb-6 break-all text-sm text-slate-700">
          {offerLink}
        </div>

        <button
          onClick={handleCopyLink}
          className="w-full bg-slate-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-slate-800 transition-colors mb-4"
        >
          {copied ? '✓ Copied!' : 'Copy Link'}
        </button>

        <button
          onClick={() => {
            setOfferLink(null);
            setBaseMax(120000);
            setEquityMax(30000);
          }}
          className="w-full bg-slate-100 text-slate-900 py-3 px-6 rounded-lg font-medium hover:bg-slate-200 transition-colors"
        >
          Create Another Offer
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <h2 className="text-2xl font-semibold mb-2">Company View</h2>
      <p className="text-slate-600 mb-6">
        Set your maximum offer. The candidate will never see this number.
      </p>

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
          <div className="animate-slideUp">
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

      <div className="mt-6 p-4 bg-slate-50 rounded-lg text-sm text-slate-600">
        <p className="font-medium mb-1">🔒 Privacy</p>
        <p>Your numbers stay private. Only the final outcome will be shared.</p>
      </div>
    </div>
  );
}

