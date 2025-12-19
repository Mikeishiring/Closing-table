export const copy = {
  company: {
    title: 'Set your maximum. Share one link.',
    subtitle: 'This link expires in 24 hours.',
    form: {
      label: 'Your maximum total compensation',
      inputAria: 'Your maximum total compensation',
      cta: 'Lock & Generate Link',
      fallbackCta: 'Lock & Generate Link',
    },
    privacyNote: '🔒 Single-use. Auto-expires. Your number stays private.',
    
    howItWorks: {
      title: 'How it works',
      steps: [
        'You set your maximum',
        'Candidate sets their minimum',
        'If ranges overlap, we split the difference',
        'Link works once, then self-destructs',
      ],
    },
    
    linkReady: {
      headline: 'Your link is ready',
      subtitle: 'Send this to your candidate. It works once.',
      explanation: 'The candidate sees only the final result — not your maximum.',
      linkLabel: 'Link',
      copy: 'Copy Link',
      copied: 'Copied ✓',
      open: 'Preview Link',
      createNew: 'Create New Offer',
      expiryNote: '⏱️ Expires in 24 hours',
    },
  },
  candidate: {
    intro: {
      headline: "You've been invited to negotiate",
      body: "Here's how this works:\n\nThe company set their maximum.\nYou set your minimum.\n\nIf your ranges overlap, we calculate a fair offer instantly.\nIf they're close but don't overlap, we suggest talking.\nIf they're far apart, we'll tell you clearly.\n\nYour number stays private. This link works once.",
      continueButton: 'Continue',
    },
    
    eyebrow: 'Offer response',
    headline: "What's your minimum?",
    subhead: '',
    privacy: "🔒 Your number stays private. We'll show you the result immediately.",
    steps: ['Set Number', 'See Result'],
    valueLabel: 'Minimum total compensation',
    sliderLabel: 'Adjust your minimum',
    inputAria: 'Minimum total compensation',
    cta: 'Lock My Number',
    fallbackCta: 'Lock My Number',
  },
  offer: {
    retry: 'Ask for a new link',
    goHome: 'Go to home',
  },
  result: {
    computing: 'Calculating…',
    startNew: 'Start New Negotiation',
    whatNextTitle: 'What happens next',
    detailsTitle: 'Details',
    statuses: {
      success: {
        title: 'You have a deal',
        subtitle: 'We split the difference.',
        line: 'This is exactly halfway between your ranges. Accept it or start over.',
        label: 'Your offer',
        accent: 'emerald',
        details: [],
        nextSteps: [],
      },
      close: {
        title: "You're close",
        subtitle: 'Talk through the gap.',
        line: "Your ranges don't overlap, but you're within 10%. Start at this number and negotiate from there.",
        label: 'Suggested starting point',
        accent: 'amber',
        details: [],
        nextSteps: [],
      },
      fail: {
        title: 'No match',
        subtitle: 'Your ranges are too far apart.',
        line: "The gap between your numbers is larger than 10%. There's no fair middle ground.",
        label: 'Result',
        accent: 'rose',
        details: [],
        nextSteps: [],
      },
    },
  },
  error: {
    title: 'Oops',
    offerNotFound: "This offer doesn't exist. Ask the company for a new link.",
    invalidOffer: "This link doesn't work. Double-check the URL or request a new one.",
    expiredOffer: 'This link expired after 24 hours. Ask for a new one.',
    resultNotFound: "We can't find this result. It may have been deleted.",
    invalidResult: "This link doesn't work. Double-check the URL.",
    expiredResult: 'Results expire after 7 days. This one is gone.',
    submitError: 'We could not submit your response. Please retry.',
    createOfferError: 'We could not create this offer. Please retry.',
    retry: 'Go to Homepage',
    goHome: 'Go to Homepage',
    
    notFoundHeadline: 'Link not found',
    expiredHeadline: 'This link expired',
    invalidHeadline: 'Invalid link',
    resultNotFoundHeadline: 'Result unavailable',
    resultExpiredHeadline: 'Result expired',
  },
  validation: {
    minMaxRange: (min, max) => `Enter a number between ${min} and ${max}.`,
  },
  accessibility: {
    progress: 'Progress',
  },
};


