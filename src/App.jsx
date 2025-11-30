/**
 * Main App Component
 * Hash-based routing between Company, Candidate, and Result views
 * Features theme variants for company vs candidate views
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHashRoute, useHaptics, useReducedMotion } from './hooks';
import { SignatureSlider } from './components/SignatureSlider';
import { AnimatedSubmitButton } from './components/AnimatedSubmitButton';
import { InitialsStamp } from './components/InitialsStamp';

/**
 * Theme configuration for company vs candidate views
 */
const THEME = {
  company: {
    gradient: 'from-slate-50 via-cyan-50/30 to-slate-50',
    cardBg: 'bg-white',
    accentRing: 'ring-teal-400/20',
    textAccent: 'text-teal-600',
  },
  candidate: {
    gradient: 'from-slate-50 via-purple-50/40 to-slate-50',
    cardBg: 'bg-white',
    accentRing: 'ring-purple-400/20',
    textAccent: 'text-purple-600',
  },
};

function App() {
  const route = useHashRoute();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8">
          The Closing Table
        </h1>

        {route.type === 'result' ? (
          <ResultViewPlaceholder resultId={route.id} />
        ) : route.type === 'offer' ? (
          <CandidateViewPlaceholder offerId={route.id} />
        ) : (
          <CompanyViewPlaceholder />
        )}
      </div>
    </div>
  );
}

/**
 * Company View with ghost signature flourish
 */
function CompanyViewPlaceholder() {
  const [value, setValue] = useState(175000);
  const [submitStatus, setSubmitStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [showSignatureFlourish, setShowSignatureFlourish] = useState(false);
  const reducedMotion = useReducedMotion();
  const theme = THEME.company;

  const handleSubmit = useCallback(async () => {
    setSubmitStatus('loading');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Trigger success
    setSubmitStatus('success');
    
    // Trigger ghost signature flourish
    if (!reducedMotion) {
      setShowSignatureFlourish(true);
      setTimeout(() => setShowSignatureFlourish(false), 1200);
    }
    
    return true; // Indicates success
  }, [reducedMotion]);

  const handleSuccess = useCallback(() => {
    console.log('Link generated successfully!');
  }, []);

  return (
    <motion.div 
      className={`rounded-2xl p-8 shadow-lg ring-1 ${theme.cardBg} ${theme.accentRing}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background gradient overlay */}
      <div 
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${theme.gradient} -z-10`}
        style={{ opacity: 0.5 }}
      />
      
      <h2 className="text-2xl font-semibold mb-6">Company View</h2>
      <p className="text-gray-600 mb-4">
        Set your maximum offer. Watch for milestone haptics as you drag!
      </p>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Maximum Total Compensation
        </label>
        <div className="text-3xl font-bold mb-4">
          ${value.toLocaleString()}
        </div>
        <SignatureSlider
          value={value}
          min={50000}
          max={300000}
          step={5000}
          onChange={(e) => setValue(Number(e.target.value))}
          variant="company"
          label="Company maximum offer"
          showSignatureFlourish={showSignatureFlourish}
        />
      </div>

      <AnimatedSubmitButton
        onClick={handleSubmit}
        buttonText="Lock it in & Get Link"
        onSuccess={handleSuccess}
        disabled={submitStatus === 'loading'}
      />

      <div className="mt-6 text-sm text-gray-500 space-y-1">
        <p>✨ Haptic feedback on milestone values ($100k, $150k, etc.)</p>
        <p>✨ Pen home animation on first load</p>
        <p>✨ Ink droplet effect on drag start</p>
        <p>✨ Ghost signature flourish on success</p>
        <p>✨ Sealed envelope animation after submit</p>
      </div>
    </motion.div>
  );
}

/**
 * Candidate View with variant theming
 */
function CandidateViewPlaceholder({ offerId }) {
  const [value, setValue] = useState(150000);
  const theme = THEME.candidate;

  return (
    <motion.div 
      className={`rounded-2xl p-8 shadow-lg ring-1 ${theme.cardBg} ${theme.accentRing}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background gradient overlay */}
      <div 
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${theme.gradient} -z-10`}
        style={{ opacity: 0.5 }}
      />

      <h2 className="text-2xl font-semibold mb-4">Candidate View</h2>
      <p className="text-gray-600 mb-2">
        Viewing offer: <code className="bg-gray-100 px-2 py-1 rounded">{offerId}</code>
      </p>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Minimum Expectation
        </label>
        <div className="text-3xl font-bold mb-4">
          ${value.toLocaleString()}
        </div>
        
        {/* Candidate-specific micro label */}
        <p className={`text-xs ${theme.textAccent} mb-2 opacity-80`}>
          Your yes starts here.
        </p>
        
        <SignatureSlider
          value={value}
          min={50000}
          max={300000}
          step={5000}
          onChange={(e) => setValue(Number(e.target.value))}
          variant="candidate"
          label="Candidate minimum expectation"
        />
      </div>

      <AnimatedSubmitButton
        onClick={() => Promise.resolve(true)}
        buttonText="Submit My Range"
      />

      <p className="mt-4 text-sm text-gray-500">
        Notice the purple accent color for the candidate view slider thumb.
      </p>
    </motion.div>
  );
}

/**
 * Result View with Initials Stamp
 */
function ResultViewPlaceholder({ resultId }) {
  const [isDealComplete, setIsDealComplete] = useState(false);
  const haptics = useHaptics();

  // Simulate deal completion after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDealComplete(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      className="bg-white rounded-2xl p-8 shadow-lg relative overflow-visible"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Initials Stamp - positioned in top-right corner */}
      <div className="absolute -top-2 -right-2 z-10">
        <InitialsStamp 
          isDealComplete={isDealComplete} 
          initials="CT"
        />
      </div>

      <h2 className="text-2xl font-semibold mb-4">Result View</h2>
      <p className="text-gray-600 mb-4">
        Viewing result: <code className="bg-gray-100 px-2 py-1 rounded">{resultId}</code>
      </p>

      {/* Deal status */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-3">
          <motion.div
            className={`w-3 h-3 rounded-full ${isDealComplete ? 'bg-green-500' : 'bg-amber-400'}`}
            animate={isDealComplete ? {} : { scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
          <span className="font-medium">
            {isDealComplete ? 'Deal Complete! ✨' : 'Waiting for both parties...'}
          </span>
        </div>
        
        {isDealComplete && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Company Max:</span>
                <span className="ml-2 font-semibold">$185,000</span>
              </div>
              <div>
                <span className="text-gray-500">Candidate Min:</span>
                <span className="ml-2 font-semibold">$160,000</span>
              </div>
            </div>
            <div className="mt-3 text-center">
              <span className="text-green-600 font-semibold text-lg">
                🎉 Match Found: $172,500
              </span>
            </div>
          </motion.div>
        )}
      </div>

      <p className="mt-4 text-sm text-gray-500">
        The stamp animation appears when both parties have completed their submissions.
      </p>
    </motion.div>
  );
}

export default App;
