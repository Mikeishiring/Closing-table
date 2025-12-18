export const copy = {
  company: {
    title: 'Set your ceiling.',
    subtitle: 'Send one link. Only the final number is shown.',
    howThisWorksTitle: 'How this works',
    howItWorks: [
      'Your max remains private.',
      'We delete all inputs after the run.',
      'Candidate only sees the final outcome.',
    ],
    form: {
      label: 'Compensation ceiling',
      inputAria: 'Compensation ceiling',
      cta: 'Slide to lock',
      fallbackCta: 'Submit',
    },
    linkDetails: [
      'Candidate sees only the final number.',
      'Your original inputs were deleted.',
      'You can reuse this offer once only.',
    ],
    linkReady: {
      title: 'Link ready',
      subtitle: 'Works once and expires in 24 hours.',
      linkLabel: 'Link',
      open: 'Open link',
      copy: 'Copy',
      copied: 'Copied',
      createNew: 'Create new offer',
      aboutTitle: 'About this link',
    },
  },
  candidate: {
    eyebrow: 'Offer response',
    headline: 'Set your ceiling once.',
    subhead:
      "Enter the single all-in compensation number you need. We'll run it against their max and show the result once.",
    privacy: 'Private, single-use link. Your entry disappears after this run.',
    steps: ['Set Number', 'See Result'],
    valueLabel: 'Minimum Total Compensation',
    sliderLabel: 'Candidate minimum total compensation',
    inputAria: 'Total compensation',
    cta: 'Slide to lock',
    fallbackCta: 'Submit',
  },
  offer: {
    retry: 'Ask for a new link',
    goHome: 'Go to home',
  },
  result: {
    computing: 'Computing…',
    startNew: 'Start new offer',
    whatNextTitle: 'What happens next',
    detailsTitle: 'Details',
    statuses: {
      success: {
        title: 'Deal reached',
        subtitle: 'Fair split',
        line: 'Ranges overlapped; surplus split 50/50.',
        label: 'Final offer',
        accent: 'emerald',
        details: [
          'Surplus split method',
          'Inputs deleted after run',
          'Result expires in 7 days',
          'Final offer timestamp',
        ],
        nextSteps: [
          'Inputs deleted after run',
          'Result expires in 7 days',
        ],
      },
      close: {
        title: 'Close gap',
        subtitle: 'Bridge together',
        line: 'Within 10% of the max; start at the midpoint together.',
        label: 'Suggested start',
        accent: 'amber',
        details: [
          'Within 10% window',
          'Inputs deleted after run',
          'Result expires in 7 days',
          'Final offer timestamp',
        ],
        nextSteps: [
          'Within 10% window',
          'Result expires in 7 days',
        ],
      },
      fail: {
        title: 'No deal',
        subtitle: 'Out of range',
        line: 'Gap is over 10%; no stretch suggested.',
        label: 'Result',
        accent: 'rose',
        details: [
          'Gap exceeds 10% threshold',
          'Inputs deleted after run',
          'Result expires in 7 days',
          'Final offer timestamp',
        ],
        nextSteps: [
          'Gap exceeds 10% threshold',
          'Inputs deleted after run',
        ],
      },
    },
  },
  error: {
    title: 'Oops',
    offerNotFound: 'Offer not found',
    invalidOffer: 'Invalid offer link',
    expiredOffer: 'Offer has expired',
    resultNotFound: 'Result not found',
    invalidResult: 'Invalid result link',
    expiredResult: 'Result has expired',
    submitError: 'Error submitting response:',
    createOfferError: 'Error creating offer:',
    retry: 'Request a fresh link',
    goHome: 'Go to home',
  },
  validation: {
    minMaxRange: (min, max) => `Please keep your minimum between ${min} and ${max}.`,
  },
  accessibility: {
    progress: 'Progress',
  },
};

