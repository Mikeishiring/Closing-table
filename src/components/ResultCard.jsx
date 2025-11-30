/**
 * ResultReveal Component
 * Minimalist reveal with big emoji + big headline as visual anchor
 */

import React, { useState, useEffect } from 'react';
import { generateResultLink, copyToClipboard } from '../lib/api';

// Simple status configuration
const RESULT_CONFIG = {
  success: {
    emoji: "✅",
    color: "text-emerald-600",
    bgRing: "ring-emerald-100",
    title: "Deal Closed",
    line: "The mechanism found a fair middle ground and split the surplus 50/50.",
    actionIcon: "🔁",
  },
  close: {
    emoji: "🤏",
    color: "text-amber-600",
    bgRing: "ring-amber-100",
    title: "Close, But Not Quite",
    line: "You're within the 10% bridge window. A human conversation could close the gap.",
    actionIcon: "💬",
  },
  fail: {
    emoji: "❌",
    color: "text-rose-600",
    bgRing: "ring-rose-100",
    title: "No Deal Under This Mechanism",
    line: "The ranges are too far apart for a fair split under the rules you agreed to.",
    actionIcon: "🔍",
  },
};

/**
 * Format currency for display
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Animated counter for number reveal
 */
function useCountUp(target, duration = 350) {
  const [count, setCount] = useState(0);
  const [breathe, setBreathe] = useState(false);
  
  useEffect(() => {
    if (!target || target === 0) return;
    
    const start = performance.now();
    const end = start + duration;
    
    const step = (timestamp) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(target * eased));
      
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(target);
        // Trigger breathe animation after count-up
        setTimeout(() => setBreathe(true), 100);
      }
    };
    
    requestAnimationFrame(step);
  }, [target, duration]);
  
  return { count, breathe };
}

/**
 * Main ResultReveal Component
 */
export function ResultCard({ status, finalOffer, suggested, gapPercent, resultId }) {
  const [stage, setStage] = useState('emoji'); // 'emoji' | 'details'
  const [copyLabel, setCopyLabel] = useState('Copy result link');
  const [showHint, setShowHint] = useState(false);
  
  const cfg = RESULT_CONFIG[status];
  const { count: displayFinal, breathe } = useCountUp(status === 'success' ? finalOffer : null, 350);
  
  // Stage timing: emoji first, then details
  useEffect(() => {
    const timer = setTimeout(() => setStage('details'), 120);
    return () => clearTimeout(timer);
  }, []);
  
  // Auto-focus primary button when details appear
  useEffect(() => {
    if (stage === 'details') {
      const btn = document.getElementById('primary-action-btn');
      if (btn) btn.focus();
    }
  }, [stage]);
  
  const handleCopy = async () => {
    const link = generateResultLink(resultId);
    const result = await copyToClipboard(link);
    
    if (result.success) {
      setCopyLabel('Copied ✓');
      setTimeout(() => setCopyLabel('Copy result link'), 1500);
    }
  };
  
  const handleNewOffer = () => {
    window.location.hash = '';
    window.location.reload();
  };
  
  // Calculate gap percentage
  const displayGap = gapPercent || (status === 'close' ? 8.0 : null);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900/70 p-4 animate-[fadeIn_280ms_ease-out]">
      {/* Subtle background shimmer for success only */}
      {status === 'success' && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent animate-pulse" />
      )}
      
      <div className="relative w-full max-w-md">
        <div className="relative bg-white rounded-3xl shadow-xl p-6 md:p-8 animate-[cardIn_280ms_ease-out]">
          
          {/* Hero band: Big emoji + outcome */}
          <header className="flex flex-col items-center text-center">
            <div
              className={`
                mb-4 flex h-16 w-16 md:h-18 md:w-18 items-center justify-center rounded-full
                bg-slate-50 ring-4 ${cfg.bgRing}
                text-4xl md:text-5xl ${cfg.color}
                animate-[emojiPop_260ms_ease-out]
              `}
            >
              <span>{cfg.emoji}</span>
            </div>
            
            <h1 className={`text-2xl md:text-3xl font-semibold text-slate-900 transition-all duration-300 ${
              stage === 'details' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}>
              {cfg.title}
            </h1>
            
            <p className={`mt-2 text-sm md:text-base text-slate-600 max-w-sm transition-all duration-300 delay-75 ${
              stage === 'details' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}>
              {cfg.line}
            </p>
          </header>

          {/* Details band: Content changes by status */}
          <main className={`mt-6 space-y-4 transition-all duration-300 delay-150 ${
            stage === 'details' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            
            {/* Success: Big number */}
            {status === 'success' && (
              <section className="text-center">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Final Offer
                </p>
                <p className={`mt-1 text-4xl md:text-5xl font-semibold text-slate-900 ${
                  breathe ? 'animate-[numberBreathe_400ms_ease-in-out]' : ''
                }`}>
                  {formatCurrency(displayFinal)}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Exactly between your ranges, without revealing either side's number.
                </p>
              </section>
            )}
            
            {/* Close: Gap percentage */}
            {status === 'close' && (
              <section className="text-center space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Gap Size
                  </p>
                  <p className="mt-1 text-3xl md:text-4xl font-semibold text-slate-900">
                    {displayGap.toFixed(1)}%
                  </p>
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You're within the 10% bridge window. The mechanism stops here so you can decide together whether to stretch.
                </p>
                {suggested && (
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
                    Non-binding starting point: <span className="font-semibold">{formatCurrency(suggested)}</span>
                  </div>
                )}
              </section>
            )}
            
            {/* Fail: Clear message */}
            {status === 'fail' && (
              <section className="text-center space-y-3">
                <p className="text-sm md:text-base text-slate-700 font-medium">
                  The gap is larger than <span className="text-rose-600">10%</span> of the company's maximum.
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  The mechanism can't suggest a fair middle without asking one of you to cross your stated limits.
                </p>
              </section>
            )}
            
          </main>

          {/* Actions band: Buttons */}
          <div className={`mt-6 flex flex-col gap-3 transition-all duration-300 delay-200 ${
            stage === 'details' ? 'opacity-100' : 'opacity-0'
          }`}>
            <button
              id="primary-action-btn"
              onClick={handleCopy}
              className="w-full rounded-full bg-slate-900 text-white py-3 text-sm font-medium hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 transition-all active:scale-[0.98]"
            >
              {copyLabel}
            </button>
            
            <button
              onClick={handleNewOffer}
              className="w-full rounded-full border border-slate-200 py-3 text-sm text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 transition-all active:scale-[0.98]"
            >
              {status === 'success' ? `Start a new offer ${cfg.actionIcon}` : 
               status === 'close' ? `Talk it through ${cfg.actionIcon}` : 
               `Back to search ${cfg.actionIcon}`}
            </button>
          </div>
          
          {/* Outcome-only hint */}
          <button
            onClick={() => setShowHint(!showHint)}
            className={`mt-4 w-full flex items-center justify-center gap-2 text-[11px] text-slate-500 hover:text-slate-700 transition-all duration-300 delay-250 ${
              stage === 'details' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span>🔐</span>
            <span>Outcome-only: neither side sees the other's number.</span>
          </button>
          
          {showHint && (
            <div className="mt-2 px-4 py-3 bg-slate-50 rounded-xl text-xs text-slate-600 animate-[slideDown_200ms_ease-out]">
              <p>• Each side's original number stays private</p>
              <p className="mt-1">• Only this final outcome is shareable</p>
              <p className="mt-1">• The mechanism is single-use</p>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

// Add custom animations to your CSS or Tailwind config
const styles = `
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes cardIn {
  0% { transform: scale(0.96); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes emojiPop {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes numberBreathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

@keyframes slideDown {
  0% { transform: translateY(-8px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
`;
