/**
 * PrivacyNote Component
 * Displays privacy-related information consistently
 * 
 * Usage:
 *   <PrivacyNote />
 *   <PrivacyNote variant="result" />
 */

const PrivacyNote = React.memo(({ variant = 'default' }) => {
    const Icons = window.Icons;
    
    const messages = {
        default: {
            title: '🔒 Privacy Protected',
            text: 'This link shows only the final outcome (success/close/fail) and the final total compensation — not anyone\'s original inputs. The mechanism kept both parties\' numbers private.',
        },
        result: {
            title: '🔒 Outcome-Only Display',
            text: 'This link shows only the final outcome — not anyone\'s original numbers. The mechanism kept both parties\' inputs private.',
        },
        form: {
            title: null,
            text: 'We only store whether a deal is possible and the final total compensation we compute. No emails collected.',
        },
    };
    
    const content = messages[variant] || messages.default;
    
    if (variant === 'form') {
        return (
            <div className="flex items-start gap-2">
                {Icons?.Lock && <Icons.Lock className="w-3.5 h-3.5 text-[#666666] flex-shrink-0 mt-0.5" />}
                <p className="text-xs text-[#666666]">{content.text}</p>
            </div>
        );
    }
    
    return (
        <div className="bg-[#EFF3F6] rounded-xl p-4 glass-panel">
            {content.title && (
                <h3 className="text-xs text-[#1C1C1E] mb-2 font-bold uppercase tracking-wide">
                    {content.title}
                </h3>
            )}
            <p className="text-xs text-[#666666]">{content.text}</p>
        </div>
    );
});

PrivacyNote.displayName = 'PrivacyNote';

// Export for global access
window.PrivacyNote = PrivacyNote;

