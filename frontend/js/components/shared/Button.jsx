/**
 * Button Component
 * Consistent button styling with variants
 * 
 * Usage:
 *   <Button variant="primary" onClick={handleClick}>Submit</Button>
 *   <Button variant="secondary">Cancel</Button>
 *   <Button variant="outline">Learn More</Button>
 *   <Button variant="gold">Copy Link</Button>
 */

const Button = React.memo(({ 
    children, 
    onClick, 
    disabled = false, 
    variant = 'primary', 
    className = '',
    type = 'button',
}) => {
    const baseStyles = `
        relative overflow-hidden px-6 py-3 font-semibold 
        rounded-full transition-all duration-200 
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
    `;
    
    const variantStyles = {
        primary: `
            bg-[#00C4CC] text-white 
            hover:bg-[#00B0B8] hover:shadow-[0_6px_20px_rgba(0,196,204,0.45)] hover:-translate-y-0.5
            shadow-[0_4px_14px_rgba(0,196,204,0.35)]
            active:translate-y-0
        `,
        secondary: `
            bg-white text-[#1C1C1E] border border-[#E0E0E0]
            hover:bg-[#F5F5F5] hover:border-[#00C4CC]
            shadow-[5px_5px_10px_#d9d9d9,-5px_-5px_10px_#ffffff]
        `,
        outline: `
            bg-transparent text-[#00C4CC] border-2 border-[#00C4CC]
            hover:bg-[#00C4CC] hover:text-white
        `,
        gold: `
            bg-gradient-to-r from-[#00C4CC] to-[#00B0B8] text-white
            hover:shadow-[0_6px_20px_rgba(0,196,204,0.5)] hover:-translate-y-0.5
            shadow-[0_4px_14px_rgba(0,196,204,0.35)]
            active:translate-y-0
        `,
        danger: `
            bg-[#FF3B30] text-white
            hover:bg-[#E53935] hover:shadow-[0_6px_20px_rgba(255,59,48,0.45)]
            shadow-[0_4px_14px_rgba(255,59,48,0.35)]
        `,
    };
    
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${className}`}
        >
            {/* Shine effect */}
            <span className="absolute inset-0 overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
            </span>
            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">{children}</span>
        </button>
    );
});

Button.displayName = 'Button';

// Export for global access
window.Button = Button;


