# Refactoring Plan: The Closing Table

This document outlines a comprehensive refactoring strategy that **preserves all functionality** while improving performance, reducing redundancy, and enhancing readability.

---

## Executive Summary

| Area | Current State | Proposed State | Impact |
|------|--------------|----------------|--------|
| Frontend Entry | 4,102 lines in single file | ~200 lines + modular imports | High maintainability |
| CSS | ~1,200 lines inline | Separate stylesheet + CSS variables | Better caching |
| Components | Inline definitions | Separate component files | Reusability |
| Sound System | 12 similar functions | Single audio module | Less code duplication |
| Icons | 15+ inline SVGs | Single icons module | ~300 lines saved |

---

## Phase 1: Extract CSS to Separate File

### Current Problem
All 1,200+ lines of CSS are embedded in `<style>` tags inside `index.html`, causing:
- No browser caching of styles
- Hard to find specific styles
- Duplicate media queries

### Proposed Structure

```
frontend/
├── index.html          (lean HTML + script imports)
├── styles/
│   ├── variables.css   (CSS custom properties)
│   ├── base.css        (typography, resets)
│   ├── components.css  (cards, buttons, inputs)
│   ├── animations.css  (keyframes, transitions)
│   └── index.css       (imports all above)
```

### Example: `styles/variables.css`

```css
:root {
  /* Colors */
  --bg-page: #F8F8F8;
  --bg-card: #FFFFFF;
  --text-primary: #1C1C1E;
  --text-secondary: #666666;
  --accent-primary: #00C4CC;
  --accent-hover: #00B0B8;
  --bg-input: #EFF3F6;
  --hover-highlight: #E5F2F9;
  --shadow-light: #d9d9d9;
  --shadow-white: #ffffff;
  --success-color: #34C759;
  --warning-color: #FF9500;
  --error-color: #FF3B30;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-full: 9999px;
  
  /* Shadows (Neumorphic) */
  --shadow-neu: 10px 10px 20px var(--shadow-light), -10px -10px 20px var(--shadow-white);
  --shadow-neu-inset: inset 3px 3px 6px #d1d9e6, inset -3px -3px 6px #ffffff;
}
```

### Benefits
- **Caching**: Browser caches CSS separately (faster repeat visits)
- **Readability**: Find styles by file name
- **Consistency**: Variables ensure design consistency

---

## Phase 2: Extract JavaScript Modules

### Current Problem
All JavaScript (~2,500 lines) is in one `<script>` tag:
- Sound functions (12 functions, ~200 lines)
- Icon definitions (15+ SVGs, ~300 lines)
- Utility functions (~50 lines)
- React components (~1,900 lines)

### Proposed Structure

```
frontend/
├── js/
│   ├── config.js       (API_BASE, constants)
│   ├── audio.js        (all sound functions)
│   ├── icons.js        (SVG icon components)
│   ├── utils.js        (helpers, haptics)
│   ├── components/
│   │   ├── shared/
│   │   │   ├── GlassCard.js
│   │   │   ├── Button.js
│   │   │   ├── AnimatedNumber.js
│   │   │   ├── Slider.js
│   │   │   ├── ProgressHeader.js
│   │   │   └── StatusBadge.js
│   │   ├── CompanyView.js
│   │   ├── CandidateView.js
│   │   ├── ResultView.js
│   │   └── App.js
│   └── index.js        (entry point)
```

---

## Phase 3: Consolidate Audio System

### Current: 12 Separate Functions (~200 lines)

```javascript
// Current: Repetitive pattern
function playTensionSound(progress) { /* ~25 lines */ }
function stopTensionSound() { /* ~5 lines */ }
function playThunkSound() { /* ~20 lines */ }
function playMagneticLatchSound() { /* ~25 lines */ }
function playCashDropSound() { /* ~40 lines */ }
function createClickSound() { /* ~30 lines */ }
function createSuccessSound() { /* ~25 lines */ }
// ... more
```

### Proposed: Single Audio Module (~80 lines)

```javascript
// frontend/js/audio.js
const AudioManager = (() => {
  let audioContext = null;
  let tensionOscillator = null;
  
  const init = () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
  };
  
  const createTone = (frequency, duration, type = 'sine', envelope = {}) => {
    const ctx = init();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.value = frequency;
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    const { attack = 0.01, decay = 0.1, sustain = 0.5, release = 0.1 } = envelope;
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(sustain, now + attack);
    gain.gain.linearRampToValueAtTime(0, now + duration);
    
    osc.start(now);
    osc.stop(now + duration);
    
    return { osc, gain };
  };
  
  return {
    playThunk: () => createTone(80, 0.15, 'sine', { attack: 0.01, sustain: 0.3 }),
    playClick: () => createTone(1000, 0.05, 'square', { sustain: 0.2 }),
    playSuccess: () => {
      createTone(523, 0.15, 'sine'); // C5
      setTimeout(() => createTone(659, 0.15, 'sine'), 100); // E5
      setTimeout(() => createTone(784, 0.2, 'sine'), 200); // G5
    },
    playMagneticLatch: () => createTone(200, 0.3, 'triangle', { attack: 0.02 }),
    // ... other sounds
  };
})();

export default AudioManager;
```

### Benefits
- **60% less code**: ~80 lines vs ~200 lines
- **Reusable**: `createTone()` handles all variations
- **Testable**: Single module to test

---

## Phase 4: Extract Icon Components

### Current: Inline SVG Objects (~300 lines)

```javascript
const Icons = {
  Lock: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" /* ... */ >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  // 15+ more icons, each 10-20 lines
};
```

### Proposed: Separate Icons Module

```javascript
// frontend/js/icons.js
const createIcon = (paths, viewBox = "0 0 24 24") => ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox={viewBox}
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    {paths}
  </svg>
);

export const Icons = {
  Lock: createIcon(<>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </>),
  
  Check: createIcon(<polyline points="20 6 9 17 4 12" />),
  
  Copy: createIcon(<>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </>),
  
  // ... all icons with shared base attributes
};
```

### Benefits
- **DRY**: Common SVG attributes defined once
- **Consistent**: All icons use same stroke settings
- **Smaller bundle**: Less repetitive code

---

## Phase 5: Create Shared UI Components

### Identified Redundant Patterns

1. **Progress Header** - Used in 6+ places with same structure
2. **Status Badge** - Used 10 times with only color variations
3. **Glass Card** - Used 37 times
4. **Privacy Note** - Repeated text in multiple places

### Example: Unified ProgressHeader Component

```javascript
// frontend/js/components/shared/ProgressHeader.js
const STEPS = [
  { label: 'Set Max', key: 'setMax' },
  { label: 'Send Link', key: 'sendLink' },
  { label: 'See Result', key: 'seeResult' },
];

const ProgressHeader = ({ currentStep, completedSteps = [] }) => (
  <div className="progress-header spotlight-content">
    <div className="progress-steps">
      {STEPS.map((step, index) => {
        const isCompleted = completedSteps.includes(step.key);
        const isCurrent = step.key === currentStep;
        const isActive = isCurrent && !isCompleted;
        
        return (
          <React.Fragment key={step.key}>
            {index > 0 && (
              <div className={`progress-divider ${isCompleted ? 'completed' : ''}`} />
            )}
            <div className="progress-step">
              <div className={`progress-circle ${
                isCompleted ? 'completed' : isActive ? 'active' : 'inactive'
              }`}>
                {isCompleted ? '✓' : index + 1}
              </div>
              <span className={`progress-label ${isActive ? 'active' : ''}`}>
                {step.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  </div>
);
```

### Current: 6 Duplicate Progress Headers (~150 lines total)
### Proposed: 1 Component (~30 lines) + 6 usages (~6 lines)

---

## Phase 6: Consolidate Result Displays

### Current Problem
ResultView has 3 nearly identical result card structures for success/close/fail states with ~80% shared code.

### Proposed: Single ResultCard with Status Prop

```javascript
// frontend/js/components/shared/ResultCard.js
const STATUS_CONFIG = {
  success: {
    color: 'var(--success-color)',
    bgGradient: 'from-green-100 to-emerald-100',
    icon: Icons.Handshake,
    title: 'Deal Closed',
    subtitle: 'The mechanism found a fair midpoint.',
    badgeEmojis: ['✅', '🎯'],
  },
  close: {
    color: 'var(--warning-color)',
    bgGradient: 'from-orange-100 to-amber-100',
    icon: Icons.AlertCircle,
    title: 'Close Gap',
    subtitle: "You're within 10% — a conversation could bridge this gap.",
    badgeEmojis: ['💬', '🤝'],
  },
  fail: {
    color: 'var(--error-color)',
    bgGradient: 'from-red-100 to-pink-100',
    icon: Icons.X,
    title: 'No Deal',
    subtitle: 'Too far apart for a fair midpoint.',
    badgeEmojis: ['🗨️', '💬'],
  },
};

const ResultCard = ({ status, finalAmount, suggestedAmount, createdAt }) => {
  const config = STATUS_CONFIG[status];
  const displayAmount = status === 'success' ? finalAmount : suggestedAmount;
  
  return (
    <div className="spotlight-container">
      <ProgressHeader currentStep="seeResult" completedSteps={['setMax', 'sendLink', 'seeResult']} />
      
      <div className="max-w-xl mx-auto animate-enter text-center spotlight-content">
        <StatusBadge type={status} />
        
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#1C1C1E] mb-4">
          {config.title}
        </h2>
        <p className="text-lg text-[#666666] mb-10">
          {config.subtitle}
        </p>
        
        {displayAmount && (
          <GlassCard className={`border-l-4 mb-6`} style={{ borderColor: config.color }}>
            <p className="text-sm text-[#666666] mb-4">
              {status === 'success' ? 'Final Total Compensation' : 'Proposed Starting Point'}
            </p>
            <div className={`hero-number-container bg-gradient-to-br ${config.bgGradient}`}>
              <p className="text-6xl font-bold tracking-tight financial-number" style={{ color: config.color }}>
                ${displayAmount.toLocaleString()}
              </p>
            </div>
            {status === 'close' && (
              <p className="text-xs text-[#666666] mt-3 italic">
                This is a non-binding suggestion for human negotiation.
              </p>
            )}
          </GlassCard>
        )}
        
        <StatusBadgeChip status={status} emojis={config.badgeEmojis} color={config.color} />
        
        <PrivacyNote />
        
        <p className="text-[#666666] text-xs mt-6">
          Result available for 7 days; no original inputs stored.
        </p>
        <p className="text-[#999999] text-xs mt-1">
          Created {new Date(createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};
```

### Savings
- **Current**: ~400 lines for 3 result states
- **Proposed**: ~80 lines for unified component
- **Reduction**: 80%

---

## Phase 7: Performance Optimizations

### 1. Lazy Load Framer Motion

```javascript
// Current: Loads entire library upfront
<script src="https://unpkg.com/framer-motion@11/dist/framer-motion.js"></script>

// Proposed: Dynamic import for animation-heavy pages only
const { motion, AnimatePresence } = await import('framer-motion');
```

### 2. Memoize Expensive Components

```javascript
// Wrap components that don't need frequent re-renders
const GlassCard = React.memo(({ children, className }) => (
  <div className={`glass-panel ${className}`}>{children}</div>
));

const StatusBadge = React.memo(({ type }) => (
  <div className={`status-badge ${type}`}>
    {/* ... */}
  </div>
));
```

### 3. Use CSS Containment

```css
/* Isolate layout calculations */
.glass-panel {
  contain: layout style;
}

.progress-header {
  contain: layout;
}
```

### 4. Preload Critical Resources

```html
<link rel="preload" href="/styles/index.css" as="style">
<link rel="preload" href="/js/index.js" as="script">
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" as="style">
```

---

## Phase 8: Simplify State Management

### Current: Scattered useState Hooks

CompanyView alone has **24 useState calls**:

```javascript
const [baseMax, setBaseMax] = useState(100000);
const [equityMax, setEquityMax] = useState(40000);
const [totalBudget, setTotalBudget] = useState(130000);
const [equityEnabled, setEquityEnabled] = useState(false);
const [showCopyToast, setShowCopyToast] = useState(false);
const [link, setLink] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
// ... 16 more
```

### Proposed: useReducer for Complex State

```javascript
// frontend/js/hooks/useCompanyForm.js
const initialState = {
  compensation: { base: 100000, equity: 40000, total: 140000 },
  ui: { equityEnabled: false, loading: false, error: null },
  animations: { baseAnimating: false, ledFlicker: false },
  result: { link: null, showCopyToast: false },
};

function companyReducer(state, action) {
  switch (action.type) {
    case 'SET_BASE':
      return {
        ...state,
        compensation: {
          ...state.compensation,
          base: action.value,
          total: action.value + (state.ui.equityEnabled ? state.compensation.equity : 0),
        },
      };
    case 'SET_EQUITY':
      return {
        ...state,
        compensation: {
          ...state.compensation,
          equity: action.value,
          total: state.compensation.base + action.value,
        },
      };
    case 'TOGGLE_EQUITY':
      return {
        ...state,
        ui: { ...state.ui, equityEnabled: !state.ui.equityEnabled },
      };
    case 'START_SUBMIT':
      return { ...state, ui: { ...state.ui, loading: true, error: null } };
    case 'SUBMIT_SUCCESS':
      return { ...state, ui: { ...state.ui, loading: false }, result: { ...state.result, link: action.link } };
    case 'SUBMIT_ERROR':
      return { ...state, ui: { ...state.ui, loading: false, error: action.error } };
    default:
      return state;
  }
}

// Usage in CompanyView
const [state, dispatch] = useReducer(companyReducer, initialState);
```

### Benefits
- **Predictable**: All state changes in one place
- **Debuggable**: Action history shows what changed
- **Testable**: Reducer is a pure function

---

## Proposed Final File Structure

```
Closing-table/
├── frontend/
│   ├── index.html              (~100 lines - just HTML shell)
│   ├── styles/
│   │   ├── variables.css       (~50 lines)
│   │   ├── base.css            (~100 lines)
│   │   ├── components.css      (~300 lines)
│   │   ├── animations.css      (~150 lines)
│   │   └── index.css           (~10 lines - imports)
│   └── js/
│       ├── config.js           (~20 lines)
│       ├── audio.js            (~80 lines)
│       ├── icons.js            (~100 lines)
│       ├── utils.js            (~30 lines)
│       ├── hooks/
│       │   ├── useCompanyForm.js
│       │   ├── useCandidateForm.js
│       │   └── useAudio.js
│       ├── components/
│       │   ├── shared/
│       │   │   ├── GlassCard.js
│       │   │   ├── Button.js
│       │   │   ├── Slider.js
│       │   │   ├── ProgressHeader.js
│       │   │   ├── StatusBadge.js
│       │   │   ├── PrivacyNote.js
│       │   │   └── index.js
│       │   ├── CompanyView.js
│       │   ├── CandidateView.js
│       │   ├── ResultView.js
│       │   └── App.js
│       └── index.js
├── server.js                   (unchanged - already clean)
└── tests/
    ├── server.test.js
    └── server.integration.test.js
```

---

## Migration Strategy

### Step 1: Extract CSS (Low Risk)
1. Create `styles/` folder
2. Move CSS block by block
3. Test after each move

### Step 2: Extract Constants & Utils (Low Risk)
1. Create `js/config.js` and `js/utils.js`
2. Move non-React code first

### Step 3: Extract Icons & Audio (Medium Risk)
1. Create modules
2. Update imports
3. Test audio functionality

### Step 4: Extract Components (Higher Risk)
1. Start with shared components (GlassCard, Button)
2. Then view components
3. Test each view thoroughly

### Step 5: Add Build Step (Optional)
Consider adding Vite or similar for:
- Module bundling
- Hot module replacement during dev
- Production minification

---

## Estimated Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| index.html lines | 4,102 | ~100 | 97% reduction |
| Total JS lines | ~2,500 | ~1,500 | 40% reduction |
| Duplicate code | ~800 lines | ~50 lines | 94% reduction |
| Files | 1 mega-file | 20+ focused files | Modular |
| Time to find code | Minutes | Seconds | Much faster |

---

## Next Steps

1. **Review this plan** and adjust priorities
2. **Start with Phase 1** (CSS extraction) - lowest risk
3. **Test thoroughly** after each phase
4. **Consider tooling** (Vite, ESLint) for Phase 5+

This refactoring maintains all functionality while making the codebase significantly more maintainable and performant.


