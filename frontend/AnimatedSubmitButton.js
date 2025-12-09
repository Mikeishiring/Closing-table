// AnimatedSubmitButton.js
// A beautiful, interactive submit button with animations and sound effects

import { createClickSound, createSuccessSound } from './click-sound.js';

// Icon components
const LockIcon = ({ isLocked, className = "" }) => {
    return isLocked ? (
        // Locked padlock
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="10" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            <circle cx="12" cy="16" r="1"></circle>
        </svg>
    ) : (
        // Unlocked padlock
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="10" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
            <circle cx="12" cy="16" r="1"></circle>
        </svg>
    );
};

const CheckIcon = ({ className = "" }) => {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    );
};

// Main AnimatedSubmitButton Component
export const AnimatedSubmitButton = ({ 
    onClick, 
    disabled = false,
    buttonText = "Lock it in & Get Link",
    className = ""
}) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [isClicked, setIsClicked] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const clickSound = React.useRef(null);
    const successSound = React.useRef(null);

    // Initialize sounds on mount
    React.useEffect(() => {
        try {
            clickSound.current = createClickSound();
            successSound.current = createSuccessSound();
        } catch (error) {
            console.warn('Audio not supported:', error);
        }
    }, []);

    const handleClick = async (e) => {
        if (disabled) return;

        e.preventDefault();
        
        // Play click sound
        try {
            clickSound.current?.();
        } catch (error) {
            console.warn('Could not play click sound:', error);
        }

        // Trigger click animation
        setIsClicked(true);
        
        // Show success state after brief delay
        setTimeout(() => {
            setShowSuccess(true);
            try {
                successSound.current?.();
            } catch (error) {
                console.warn('Could not play success sound:', error);
            }
        }, 150);

        // Call the onClick handler after success animation
        setTimeout(() => {
            onClick?.(e);
        }, 650);

        // Reset states after animation completes
        setTimeout(() => {
            setIsClicked(false);
            setShowSuccess(false);
        }, 1000);
    };

    // Base button styles
    const baseStyles = "w-full font-semibold py-4 px-6 rounded-full transition-all flex items-center justify-center gap-3 relative overflow-hidden";
    
    // Dynamic styles based on state
    const getButtonStyles = () => {
        if (disabled) {
            return "bg-gray-300 text-gray-500 cursor-not-allowed";
        }
        if (showSuccess) {
            return "bg-[#34C759] text-white";
        }
        return "bg-[#00C4CC] text-white shadow-[0_4px_14px_rgba(0,196,204,0.35)]";
    };

    // Animation variants for Framer Motion
    const buttonVariants = {
        initial: {
            scale: 1,
            y: 0,
            boxShadow: "0 4px 14px rgba(0,196,204,0.35)"
        },
        hover: {
            y: -4,
            scale: 1.02,
            boxShadow: "0 8px 24px rgba(0,196,204,0.5)",
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 17
            }
        },
        tap: {
            scale: 0.95,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 500,
                damping: 15
            }
        },
        success: {
            scale: 1,
            borderRadius: "50%",
            width: "64px",
            height: "64px",
            transition: {
                duration: 0.3,
                ease: "easeInOut"
            }
        }
    };

    const iconVariants = {
        initial: { 
            scale: 1,
            rotate: 0
        },
        hover: { 
            scale: 1.1,
            rotate: -5,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 10
            }
        },
        locked: {
            scale: 1,
            rotate: 0,
            transition: {
                type: "spring",
                stiffness: 500,
                damping: 15
            }
        }
    };

    const textVariants = {
        initial: { opacity: 1, x: 0 },
        exit: { 
            opacity: 0,
            x: -20,
            transition: { duration: 0.2 }
        }
    };

    const checkVariants = {
        initial: { 
            scale: 0,
            opacity: 0,
            rotate: -180
        },
        show: { 
            scale: 1,
            opacity: 1,
            rotate: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
            }
        }
    };

    return (
        <motion.button
            className={`${baseStyles} ${getButtonStyles()} ${className}`}
            onClick={handleClick}
            disabled={disabled}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            variants={buttonVariants}
            initial="initial"
            animate={showSuccess ? "success" : isClicked ? "tap" : isHovered ? "hover" : "initial"}
            whileTap="tap"
        >
            {/* Success checkmark state */}
            {showSuccess ? (
                <motion.div
                    variants={checkVariants}
                    initial="initial"
                    animate="show"
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <CheckIcon className="w-8 h-8" />
                </motion.div>
            ) : (
                <>
                    {/* Lock icon with animation */}
                    <motion.div
                        variants={iconVariants}
                        initial="initial"
                        animate={isHovered ? "hover" : "locked"}
                        className="w-5 h-5"
                    >
                        <LockIcon isLocked={isHovered} className="w-full h-full" />
                    </motion.div>
                    
                    {/* Button text */}
                    <motion.span
                        variants={textVariants}
                        initial="initial"
                        animate={isClicked ? "exit" : "initial"}
                    >
                        {buttonText}
                    </motion.span>
                </>
            )}

            {/* Ripple effect on click */}
            {isClicked && !showSuccess && (
                <motion.div
                    className="absolute inset-0 bg-white rounded-full"
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                />
            )}
        </motion.button>
    );
};

export default AnimatedSubmitButton;



