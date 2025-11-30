/**
 * ResultCard Component
 * Full-screen grand reveal with 3-beat staged sequence
 */

import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../lib/deal-math';
import { generateResultLink, copyToClipboard } from '../lib/api';

// Status configuration with personality for each outcome
const STATUS_CONFIG = {
  success: {
    title: "Deal Closed",
    subtitle: "The mechanism found a fair middle ground and split the surplus 50/50.",
    icon: "✓",
    bg: "from-emerald-500/15",
    iconBg: "bg-emerald-500",
    textAccent: "text-emerald-600",
  },
  close: {
    title: "Close, But Not Quite",
    subtitle: "You're within the 10% bridge window. A human conversation could close the gap.",
    icon: "~",
    bg: "from-amber-500/15",
    iconBg: "bg-amber-500",
    textAccent: "text-amber-600",
  },
  fail: {
    title: "No Deal Under This Mechanism",
    subtitle: "The ranges are too far apart for a fair split within the rules you agreed to.",
    icon: "✕",
    bg: "from-rose-500/15",
    iconBg: "bg-rose-500",
    textAccent: "text-rose-600",
  },
};

/**
 * Animated counter hook for number reveal
 */
function useCountUp(target, duration = 600) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!target || target === 0) return;
    
    const start = performance.now();
    const end = start + duration;
    
    const step = (timestamp) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(target * eased));
      
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };
    
    requestAnimationFrame(step);
  }, [target, duration]);
  
  return count;
}

/**
 * Collapsible Privacy Explainer
 */
function PrivacyExplainer() {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="mt-6 text-xs text-slate-500">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 hover:text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="underline">How your numbers stayed private</span>
        <svg 
          className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {expanded && (
        <div className="mt-2 pl-6 space-y-1 text-slate-600 animate-in fade-in slide-in-from-top-1 duration-200">
          <p>• Each side's original number is never shown to the other.</p>
          <p>• Only this final outcome is visible via the link.</p>
          <p>• The mechanism is single-use and doesn't store negotiation history.</p>
        </div>
      )}
    </div>
  );
}

/**
 * Range Visualization Bars
 */
function RangeVisualization({ status }) {
  const config = STATUS_CONFIG[status];
  
  if (status === 'success') {
    return (
      <div className="space-y-2">
        <div className="relative h-2 rounded-full bg-slate-100">
          {/* Overlap band */}
          <div className="absolute left-1/4 right-1/4 h-full bg-emerald-200 rounded-full" />
          {/* Final offer dot */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-500 rounded-full shadow-sm animate-in zoom-in duration-300"
          />
        </div>
        <p className="text-xs text-slate-500 text-center">
          The green band is the shared surplus. Endpoints remain private.
        </p>
      </div>
    );
  }
  
  if (status === 'close') {
    return (
      <div className="space-y-2">
        <div className="relative h-2 rounded-full bg-slate-100 flex items-center gap-1 px-2">
          <div className="flex-1 h-full bg-amber-200 rounded-l-full" />
          <div className="w-3 h-full bg-slate-300" />
          <div className="flex-1 h-full bg-amber-200 rounded-r-full" />
        </div>
        <p className="text-xs text-slate-500 text-center">
          Close but not overlapping. A small gap remains that a conversation can resolve.
        </p>
      </div>
    );
  }
  
  if (status === 'fail') {
    return (
      <div className="space-y-2">
        <div className="relative h-2 rounded-full bg-slate-100 flex items-center justify-between px-2">
          <div className="w-1/4 h-full bg-rose-200 rounded-l-full" />
          <div className="flex-1 h-full bg-slate-300 mx-2" />
          <div className="w-1/4 h-full bg-rose-200 rounded-r-full" />
        </div>
        <p className="text-xs text-slate-500 text-center">
          The gap is larger than 10%. The mechanism can't suggest a fair middle without asking someone to cross their limits.
        </p>
      </div>
    );
  }
  
  return null;
}

/**
 * Info Box for guidance
 */
function InfoBox({ status, suggested }) {
  if (status === 'close') {
    return (
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <h4 className="font-semibold text-slate-900 text-sm mb-2">Suggested next move</h4>
        <p className="text-sm text-slate-700 mb-2">
          A conversation could bridge this gap. The tool stops here to leave room for human judgment.
        </p>
        {suggested && (
          <p className="text-sm text-slate-600">
            Non-binding starting point: <span className="font-semibold">{formatCurrency(suggested)}</span>
          </p>
        )}
      </div>
    );
  }
  
  if (status === 'fail') {
    return (
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <h4 className="font-semibold text-slate-900 text-sm mb-2">What this tells you</h4>
        <p className="text-sm text-slate-700">
          The mechanism protected both sides from crossing their limits. A new offer with new numbers would be needed to try again.
        </p>
      </div>
    );
  }
  
  return null;
}

/**
 * Toast Notification
 */
function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="fixed bottom-4 inset-x-0 flex justify-center pointer-events-none z-50">
      <div className="pointer-events-auto rounded-full bg-slate-900 text-white text-xs px-4 py-2 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
        {message}
      </div>
    </div>
  );
}

/**
 * Main ResultCard Component
 */
export function ResultCard({ status, finalOffer, suggested, gapPercent, resultId }) {
  const [stage, setStage] = useState('locking'); // 'locking' | 'headline' | 'details'
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [copyLabel, setCopyLabel] = useState('Copy result link');
  
  const config = STATUS_CONFIG[status];
  const countedValue = useCountUp(status === 'success' ? finalOffer : null, 600);
  
  // 3-beat reveal sequence
  useEffect(() => {
    const t1 = setTimeout(() => setStage('headline'), 500);
    const t2 = setTimeout(() => setStage('details'), 900);
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);
  
  const handleCopy = async (type) => {
    let text;
    
    if (type === 'result') {
      const link = generateResultLink(resultId);
      text = link;
      setToastMessage('Link copied — only this outcome is visible.');
    } else if (type === 'summary') {
      text = `Negotiation outcome: ${config.title}\n\n${config.subtitle}`;
      if (status === 'close' && suggested) {
        text += `\n\nSuggested starting point: ${formatCurrency(suggested)}`;
      }
      setToastMessage('Summary copied to clipboard.');
    }
    
    const result = await copyToClipboard(text);
    if (result.success) {
      setShowToast(true);
      setCopyLabel('Copied ✓');
      setTimeout(() => setCopyLabel(type === 'result' ? 'Copy result link' : 'Copy summary'), 2000);
    }
  };
  
  const handleNewOffer = () => {
    window.location.hash = '';
    window.location.reload();
  };
  
  // Calculate display gap
  const displayGap = gapPercent || (status === 'close' ? 8 : status === 'fail' ? 15 : null);
  
  return (
    <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      {/* Status-specific halo */}
      <div 
        className={`pointer-events-none absolute inset-x-0 -top-24 h-40 bg-gradient-to-b ${config.bg} to-transparent blur-2xl`}
      />
      
      {/* Card */}
      <div className="relative w-full max-w-xl mx-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl transition-transform hover:shadow-xl hover:-translate-y-0.5">
        <div className="p-6 md:p-8">
          
          {/* Beat 1: Locking state */}
          <div className={`transition-all duration-300 ${
            stage === 'locking' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 hidden'
          }`}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 animate-pulse">
                <svg className="w-5 h-5 text-slate-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-600">Outcome locked in — running the mechanism…</p>
              </div>
            </div>
          </div>
          
          {/* Beat 2 & 3: Headline + Details */}
          <div className={`transition-all duration-300 ${
            stage === 'headline' || stage === 'details' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            
            {/* Header row (icon + title) */}
            <div className="flex items-start gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-full ${config.iconBg} text-white text-xl font-bold shadow-lg ${
                status === 'success' ? 'animate-in zoom-in duration-300' : 
                status === 'close' ? 'animate-pulse' :
                'animate-in zoom-in duration-300'
              }`}>
                {config.icon}
              </div>
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl font-semibold text-slate-900 relative">
                  {config.title}
                  {/* Animated underline */}
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-slate-300 to-transparent animate-in slide-in-from-left duration-500" />
                </h1>
                <p className="mt-1.5 text-sm md:text-base text-slate-600">{config.subtitle}</p>
              </div>
            </div>
            
            {/* Beat 3: Details section */}
            <div className={`transition-all duration-300 delay-200 ${
              stage === 'details' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}>
              
              {/* Hero metric section */}
              <div className={`mt-6 ${status === 'success' ? 'mb-8' : 'mb-6'}`}>
                {status === 'success' && (
                  <div className="text-center">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                      Final Offer
                    </div>
                    <div className="text-3xl md:text-4xl font-semibold text-slate-900 mb-2">
                      {formatCurrency(countedValue)}
                    </div>
                    <p className="text-sm text-slate-600">
                      Locked in by the double-blind mechanism.
                    </p>
                  </div>
                )}
                
                {status === 'close' && (
                  <div className="text-center">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                      Gap Size
                    </div>
                    <div className="text-3xl md:text-4xl font-semibold text-slate-900 mb-2">
                      {displayGap}%
                    </div>
                    <p className="text-sm text-slate-600">
                      A small gap that a conversation could resolve.
                    </p>
                  </div>
                )}
                
                {status === 'fail' && (
                  <div className="text-center">
                    <p className="text-sm font-medium text-rose-600">
                      Gap &gt; 10% of company's maximum
                    </p>
                  </div>
                )}
              </div>
              
              {/* Layout: Grid for success/close on desktop, stack for fail */}
              <div className={status !== 'fail' ? 'grid gap-6' : 'space-y-6'}>
                
                {/* Visualization */}
                <div>
                  <RangeVisualization status={status} />
                </div>
                
                {/* Info box */}
                <InfoBox status={status} suggested={suggested} />
                
              </div>
              
              {/* Action buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleCopy(status === 'close' ? 'summary' : 'result')}
                  className="flex-1 w-full bg-slate-900 text-white text-sm font-medium py-3 px-6 rounded-full hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {status === 'close' ? 'Copy summary' : copyLabel}
                </button>
                <button
                  onClick={handleNewOffer}
                  className="flex-1 w-full bg-white text-slate-900 text-sm font-medium py-3 px-6 rounded-full border border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Create another offer
                </button>
              </div>
              
              {/* Privacy explainer */}
              <PrivacyExplainer />
              
            </div>
            
          </div>
          
        </div>
      </div>
      
      {/* Toast */}
      {showToast && (
        <Toast 
          message={toastMessage} 
          onClose={() => setShowToast(false)} 
        />
      )}
    </div>
  );
}
