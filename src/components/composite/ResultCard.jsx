/**
 * ResultReveal Component
 * Minimalist reveal with big emoji + big headline as visual anchor
 */

import React, { useState, useEffect } from 'react';
import { RESULT_CONFIG, PRIVACY_COPY, EXPIRY } from '../../tokens';
import { goHome } from '../../routing';
import { useReducedMotion } from '../../hooks';

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
function useCountUp(target, duration = 350, disabled = false) {
  const [count, setCount] = useState(0);
  const [breathe, setBreathe] = useState(false);
  
  useEffect(() => {
    if (!target || target === 0) {
      setCount(target || 0);
      return;
    }

    if (disabled) {
      setCount(target);
      setBreathe(false);
      return;
    }
    
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
  }, [target, duration, disabled]);
  
  return { count, breathe };
}

/**
 * Main ResultReveal Component
 */
function ResultCardInner({ status, finalOffer, suggested }) {
  const [stage, setStage] = useState('computing'); // 'computing' | 'emoji' | 'details'
  const [slotValue, setSlotValue] = useState(null);
  const cfg = RESULT_CONFIG[status] || RESULT_CONFIG.fail;
  const reducedMotion = useReducedMotion();
  const revealTarget =
    status === 'success' ? finalOffer : status === 'close' ? suggested : null;
  const { count: displayFinal, breathe } = useCountUp(
    stage === 'details' ? revealTarget : null,
    420,
    reducedMotion
  );

  useEffect(() => {
    if (reducedMotion) {
      setSlotValue(revealTarget);
      setStage('details');
      return;
    }

    if (status === 'fail') {
      const t = setTimeout(() => setStage('details'), 1200);
      return () => clearTimeout(t);
    }

    // Slot-machine pre-reveal
    const runInterval = setInterval(() => {
      const random = Math.floor(80_000 + Math.random() * 280_000);
      setSlotValue(random);
    }, 80);

    const timer = setTimeout(() => {
      clearInterval(runInterval);
      setStage('emoji');
      setTimeout(() => setStage('details'), 200);
    }, 1500);

    return () => {
      clearInterval(runInterval);
      clearTimeout(timer);
    };
  }, [status, reducedMotion, revealTarget]);

  useEffect(() => {
    if (reducedMotion) return;

    if (stage === 'details' && status === 'success') {
      import('canvas-confetti')
        .then((m) =>
          m.default({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 },
            ticks: 180,
          })
        )
        .catch(() => {});
    }
  }, [stage, status, reducedMotion]);
  
  const handleNewOffer = () => {
    goHome();
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900/70 p-4 animate-[fadeIn_280ms_ease-out]">
      {/* Subtle background shimmer for success only */}
      {status === 'success' && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent animate-pulse" />
      )}
      
      <div className="relative w-full max-w-md">
        <div className="relative primary-card p-6 md:p-8 animate-[cardIn_280ms_ease-out]">
          
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
              stage !== 'computing' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}>
              {stage === 'computing' ? 'Computing…' : cfg.title}
            </h1>
            
            <p className={`mt-2 text-sm md:text-base text-slate-600 max-w-sm transition-all duration-300 delay-75 ${
              stage !== 'computing' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}>
              {cfg.line}
            </p>
          </header>

          {/* Details band: Content changes by status */}
          <main className="mt-6 space-y-4 transition-all duration-300 delay-150">
            {stage === 'computing' && (
              <section className="text-center space-y-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Computing…</p>
                <p className="text-4xl md:text-5xl font-semibold text-slate-900">
                  {slotValue ? formatCurrency(slotValue) : '—'}
                </p>
              </section>
            )}

            {stage === 'details' && (
              <>
                {status === 'success' && (
                  <section className="text-center">
                    <p className="text-xs uppercase tracking-[0.18em] text-emerald-500">
                      Final Offer
                    </p>
                    <p className={`mt-1 text-4xl md:text-5xl font-semibold text-emerald-600 ${
                      breathe ? 'animate-[numberBreathe_400ms_ease-in-out]' : ''
                    }`}>
                      {formatCurrency(displayFinal)}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Exactly between your ranges; inputs were deleted after the run.
                    </p>
                  </section>
                )}

                {status === 'close' && (
                  <section className="text-center space-y-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-amber-500">
                        Bridge Window
                      </p>
                      <p className="mt-1 text-base md:text-lg font-semibold text-amber-600">
                        {suggested ? formatCurrency(displayFinal || suggested) : 'Within 10% of max'}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      The mechanism pauses here so you can decide together whether to stretch.
                    </p>
                    {suggested && (
                      <div className="rounded-2xl bg-amber-50 px-4 py-3 text-xs text-amber-700">
                        Start at the midpoint: <span className="font-semibold">{formatCurrency(suggested)}</span>
                      </div>
                    )}
                  </section>
                )}

                {status === 'fail' && (
                  <section className="text-center space-y-3">
                    <p className="text-sm md:text-base text-slate-700 font-medium">
                      The gap is larger than <span className="text-slate-500">10%</span> of the company's maximum.
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      The mechanism won't suggest a middle that crosses either side's stated limit.
                    </p>
                  </section>
                )}
              </>
            )}
          </main>

          {/* Actions band: Buttons */}
          <div className={`mt-6 flex flex-col gap-3 transition-all duration-300 delay-200 ${
            stage === 'details' ? 'opacity-100' : 'opacity-0'
          }`}>
            <button
              onClick={handleNewOffer}
              className="w-full rounded-full border border-slate-200 py-3 text-sm text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 transition-all active:scale-[0.98]"
            >
              {status === 'success' ? `Start new offer ${cfg.actionIcon}` : 
               status === 'close' ? `Talk it through ${cfg.actionIcon}` : 
               `Try again ${cfg.actionIcon}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ResultCard = React.memo(ResultCardInner);

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

// Inject styles once
if (typeof document !== 'undefined' && !document.getElementById('result-card-animations')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'result-card-animations';
  styleEl.innerHTML = styles;
  document.head.appendChild(styleEl);
}


