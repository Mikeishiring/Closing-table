/**
 * ProgressHeader Component
 * Displays the 3-step progress indicator at the top of pages
 * 
 * Usage:
 *   <ProgressHeader currentStep="sendLink" completedSteps={['setMax']} />
 */

const ProgressHeader = ({ currentStep, completedSteps = [] }) => {
    const steps = window.AppConfig?.PROGRESS_STEPS || [
        { key: 'setMax', label: 'Set Max' },
        { key: 'sendLink', label: 'Send Link' },
        { key: 'seeResult', label: 'See Result' },
    ];
    
    return (
        <div className="progress-header spotlight-content">
            <div className="progress-steps">
                {steps.map((step, index) => {
                    const isCompleted = completedSteps.includes(step.key);
                    const isCurrent = step.key === currentStep;
                    const isActive = isCurrent && !isCompleted;
                    
                    return (
                        <React.Fragment key={step.key}>
                            {index > 0 && (
                                <div className={`progress-divider ${completedSteps.includes(steps[index - 1].key) ? 'completed' : ''}`} />
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
};

// Export for global access
window.ProgressHeader = ProgressHeader;



