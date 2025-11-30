/**
 * GlassCard Component
 * Neumorphic card with optional interaction tracking
 * 
 * Usage:
 *   <GlassCard className="border-l-4 border-[#00C4CC]">
 *     Content here
 *   </GlassCard>
 */

const GlassCard = React.memo(({ children, className = '', onInteraction }) => {
    const cardRef = React.useRef(null);
    
    React.useEffect(() => {
        if (!onInteraction) return;
        
        const card = cardRef.current;
        if (!card) return;
        
        const handleFocus = () => {
            if (onInteraction) onInteraction(true);
        };
        
        const handleBlur = () => {
            if (onInteraction) onInteraction(false);
        };
        
        const inputs = card.querySelectorAll('input, button, [role="slider"]');
        inputs.forEach(input => {
            input.addEventListener('focus', handleFocus);
            input.addEventListener('blur', handleBlur);
        });
        
        return () => {
            inputs.forEach(input => {
                input.removeEventListener('focus', handleFocus);
                input.removeEventListener('blur', handleBlur);
            });
        };
    }, [onInteraction]);
    
    return (
        <div 
            ref={cardRef} 
            className={`bg-white border-none shadow-[10px_10px_20px_#d9d9d9,-10px_-10px_20px_#ffffff] rounded-[20px] p-8 card-hover ${className}`}
        >
            {children}
        </div>
    );
});

GlassCard.displayName = 'GlassCard';

// Export for global access
window.GlassCard = GlassCard;

