/**
 * ResultCard Component
 * Full-screen grand reveal for negotiation outcomes
 * Three outcomes: FAIR_SPLIT (success), BRIDGE_ZONE (close), NO_DEAL (fail)
 */

import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../lib/deal-math';
import { generateResultLink, copyToClipboard } from '../lib/api';

// Status configuration for each outcome type
const STATUS_CONFIG = {
  success: {
    title: 'Deal Closed',
    subtitle: 'The mechanism found a fair middle ground and split the surplus 50/50.',
    iconBg: 'bg-emerald-500',
    iconColor: 'text-white',
    glowColor: 'from-emerald-500/20',
    icon: '✓',
    heroLabel: 'Final Offer',
    heroColor: 'text-slate-900',
  },
  close: {
    title: 'Close, But Not Quite',
    subtitle: "You're within the 10% bridge window. A human conversation could close the gap.",
    iconBg: 'bg-amber-500',
    iconColor: 'text-white',
    glowColor: 'from-amber-500/20',
    icon: '~',
    heroLabel: 'Gap Size',
    heroColor: 'text-slate-900',
  },
  fail: {
    title: 'No Deal Under This Mechanism',
    subtitle: 'The ranges are too far apart for a fair split within the rules you agreed to.',
    iconBg: 'bg-rose-500',
    iconColor: 'text-white',
    glowColor: 'from-rose-500/20',
    icon: '✕',
    heroLabel: null,
    heroColor: 'text-slate-900',
  },
};

/**
 * Counter animation for numbers
 */
function useCountUp(target, duration = 800) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!target) return;
    
    const start = performance.now();
    const end = start + duration;
    
    const step = (timestamp) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
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
 * Compact Privacy Explainer
 */
function PrivacyExplainer() {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="mt-6 text-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="underline">How your numbers stayed private</span>
        <svg 
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {expanded && (
        <div className="mt-3 p-4 bg-slate-50 rounded-lg space-y-2 text-slate-700 animate-fadeIn">
          <p>• Each side's original number is never shown to the other.</p>
          <p>• Only this final outcome is visible via the link.</p>
          <p>• The mechanism is single-use and doesn't store negotiation history.</p>
        </div>
      )}
    </div>
  );
}

/**
 * Range Visualization Bar
 */
function RangeVisualization({ status, finalOffer, gapPercent }) {
  if (status === 'success') {
    return (
      <div className="space-y-2">
        <div className="relative h-2 rounded-full bg-slate-100">
          {/* Shared surplus band */}
          <div className="absolute left-1/4 right-1/4 h-full bg-emerald-200 rounded-full" />
          {/* Final offer dot */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-500 rounded-full shadow-sm"
            style={{ left: '50%', transform: 'translate(-50%, -50%)' }}
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
        <div className="relative h-2 rounded-full bg-slate-100 flex items-center justify-center gap-1 px-2">
          {/* Left range (candidate) */}
          <div className="flex-1 h-full bg-amber-200 rounded-l-full" />
          {/* Small gap */}
          <div className="w-4 h-full bg-slate-300" />
          {/* Right range (company) */}
          <div className="flex-1 h-full bg-amber-200 rounded-r-full" />
        </div>
        <p className="text-xs text-slate-500 text-center">
          The mechanism found you're close but not overlapping. A small gap remains that only a conversation can resolve.
        </p>
      </div>
    );
  }
  
  if (status === 'fail') {
    return (
      <div className="space-y-2">
        <div className="relative h-2 rounded-full bg-slate-100 flex items-center justify-between px-2">
          {/* Left range (candidate) */}
          <div className="w-1/4 h-full bg-rose-200 rounded-l-full" />
          {/* Wide gap */}
          <div className="flex-1 h-full bg-slate-300 mx-2" />
          {/* Right range (company) */}
          <div className="w-1/4 h-full bg-rose-200 rounded-r-full" />
        </div>
        <p className="text-xs text-slate-500 text-center">
          The gap between acceptable ranges is larger than 10%. The mechanism can't suggest a fair middle without asking one of you to cross your stated limits.
        </p>
      </div>
    );
  }
  
  return null;
}

/**
 * Info Box for BRIDGE_ZONE and NO_DEAL
 */
function InfoBox({ status, suggested }) {
  if (status === 'close') {
    return (
      <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <h4 className="font-semibold text-slate-900 mb-2">Suggested next move</h4>
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
      <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <h4 className="font-semibold text-slate-900 mb-2">What this tells you</h4>
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
    <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg animate-slideUp">
      {message}
    </div>
  );
}

/**
 * Main ResultCard Component
 */
export function ResultCard({ status, finalOffer, suggested, gapPercent, resultId }) {
  const [phase, setPhase] = useState(1); // 1: Intro, 2: Headline, 3: Details
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const config = STATUS_CONFIG[status];
  const countedValue = useCountUp(status === 'success' ? finalOffer : null, 1000);
  
  // Phase transitions - reduced timing for faster reveal
  useEffect(() => {
    const timer1 = setTimeout(() => setPhase(2), 400);  // Reduced from 600ms
    const timer2 = setTimeout(() => setPhase(3), 800);  // Reduced from 1200ms
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);
  
  // Calculate gap percentage for display
  const displayGap = gapPercent || (suggested && finalOffer ? 
    (Math.abs(suggested - finalOffer) / finalOffer * 100).toFixed(1) : 
    null);
  
  const handleCopy = async (type) => {
    let text;
    
    if (type === 'result') {
      const link = generateResultLink(resultId);
      text = link;
      setToastMessage('Link copied. Anyone with it can see this outcome only.');
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
    }
  };
  
  const handleNewOffer = () => {
    window.location.hash = '';
    window.location.reload();
  };
  
  return (
    <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center p-4 z-50 animate-fadeIn">
      {/* Background glow */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${config.glowColor} to-transparent blur-3xl opacity-50`}
        style={{ 
          maskImage: 'radial-gradient(circle at center, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 20%, transparent 70%)'
        }}
      />
      
      {/* Card */}
      <div className="relative w-full max-w-xl mx-4 bg-white rounded-2xl shadow-2xl p-8 animate-scaleIn">
        {/* Phase 1: Intro */}
        {phase >= 1 && (
          <div className={`text-center mb-6 transition-opacity duration-300 ${phase > 1 ? 'opacity-0' : 'opacity-100'}`}>
            <div className="inline-block animate-spin-slow">
              <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-slate-600 mt-2">Outcome locked in</p>
          </div>
        )}
        
        {/* Phase 2: Headline */}
        {phase >= 2 && (
          <div className={`transition-opacity duration-500 ${phase < 2 ? 'opacity-0' : phase === 2 ? 'opacity-100' : 'opacity-100'}`}>
            {/* Icon + Title Row */}
            <div className="flex items-start gap-4 mb-6">
              <div className={`flex-shrink-0 w-14 h-14 ${config.iconBg} ${config.iconColor} rounded-full flex items-center justify-center text-2xl font-bold shadow-lg`}>
                {config.icon}
              </div>
              <div className="flex-1 pt-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">{config.title}</h2>
                <p className="text-sm text-slate-600">{config.subtitle}</p>
              </div>
            </div>
            
            {/* Phase 3: Details */}
            {phase >= 3 && (
              <div className="space-y-6 animate-slideUp">
                {/* Hero Metric */}
                <div className="text-center py-6">
                  {status === 'success' && (
                    <>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                        {config.heroLabel}
                      </div>
                      <div className={`text-4xl md:text-5xl font-semibold ${config.heroColor} mb-2`}>
                        {formatCurrency(countedValue)}
                      </div>
                      <p className="text-sm text-slate-600">
                        Locked in by the double-blind mechanism.
                      </p>
                    </>
                  )}
                  
                  {status === 'close' && (
                    <>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                        {config.heroLabel}
                      </div>
                      <div className={`text-4xl md:text-5xl font-semibold ${config.heroColor} mb-2`}>
                        {displayGap}%
                      </div>
                      <p className="text-sm text-slate-600">
                        A small gap that a conversation could resolve.
                      </p>
                    </>
                  )}
                  
                  {status === 'fail' && (
                    <p className="text-lg text-slate-700">
                      The gap was too wide for the mechanism to propose a fair number.
                    </p>
                  )}
                </div>
                
                {/* Visualization */}
                <RangeVisualization 
                  status={status} 
                  finalOffer={finalOffer}
                  gapPercent={displayGap}
                />
                
                {/* Info Box */}
                <InfoBox status={status} suggested={suggested} />
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={() => handleCopy(status === 'close' ? 'summary' : 'result')}
                    className="flex-1 bg-slate-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {status === 'close' ? 'Copy bridge-zone summary' : 'Copy result link'}
                  </button>
                  <button
                    onClick={handleNewOffer}
                    className="flex-1 bg-slate-100 text-slate-900 py-3 px-6 rounded-lg font-medium hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Create another offer
                  </button>
                </div>
                
                {/* Privacy Explainer */}
                <PrivacyExplainer />
              </div>
            )}
          </div>
        )}
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

