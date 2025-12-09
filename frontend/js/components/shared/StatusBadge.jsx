/**
 * StatusBadge Component
 * Animated circular badge showing result status
 * 
 * Usage:
 *   <StatusBadge status="success" />
 *   <StatusBadge status="close" />
 *   <StatusBadge status="fail" />
 */

const StatusBadge = ({ status, size = 'large' }) => {
    const { motion } = window.Motion || {};
    const Icons = window.Icons;
    
    const config = {
        success: {
            className: 'success',
            icon: Icons?.Handshake,
        },
        close: {
            className: 'warning',
            icon: Icons?.AlertCircle,
        },
        fail: {
            className: 'error',
            icon: Icons?.X,
        },
        teal: {
            className: 'teal',
            icon: Icons?.Lock,
        },
    };
    
    const current = config[status] || config.teal;
    const IconComponent = current.icon || Icons?.Lock;
    const sizeClass = size === 'large' ? 'w-12 h-12' : 'w-8 h-8';
    
    const badge = (
        <div className={`status-badge ${current.className}`}>
            {IconComponent && <IconComponent className={`${sizeClass} text-white`} />}
        </div>
    );
    
    // Use motion if available, otherwise return static
    if (motion) {
        return (
            <motion.div 
                className="mb-8 flex justify-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                {badge}
            </motion.div>
        );
    }
    
    return <div className="mb-8 flex justify-center">{badge}</div>;
};

// Export for global access
window.StatusBadge = StatusBadge;


