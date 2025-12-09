/**
 * Icons Module
 * Centralized SVG icon components - replaces inline definitions
 * All icons use consistent stroke settings for visual harmony
 */

const createSvgIcon = (pathContent, viewBox = "0 0 24 24") => {
    return ({ className }) => (
        React.createElement('svg', {
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: viewBox,
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            className: className
        }, pathContent)
    );
};

const Icons = {
    Lock: createSvgIcon([
        React.createElement('rect', { key: 'rect', x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }),
        React.createElement('path', { key: 'path', d: "M7 11V7a5 5 0 0 1 10 0v4" })
    ]),
    
    Unlock: createSvgIcon([
        React.createElement('rect', { key: 'rect', x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }),
        React.createElement('path', { key: 'path', d: "M7 11V7a5 5 0 0 1 9.9-1" })
    ]),
    
    Mail: createSvgIcon([
        React.createElement('path', { key: 'path', d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" }),
        React.createElement('polyline', { key: 'polyline', points: "22,6 12,13 2,6" })
    ]),
    
    Check: createSvgIcon(
        React.createElement('polyline', { points: "20 6 9 17 4 12" })
    ),
    
    Copy: createSvgIcon([
        React.createElement('rect', { key: 'rect', x: "9", y: "9", width: "13", height: "13", rx: "2", ry: "2" }),
        React.createElement('path', { key: 'path', d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })
    ]),
    
    ArrowRight: createSvgIcon([
        React.createElement('line', { key: 'line', x1: "5", y1: "12", x2: "19", y2: "12" }),
        React.createElement('polyline', { key: 'polyline', points: "12 5 19 12 12 19" })
    ]),
    
    Handshake: createSvgIcon([
        React.createElement('path', { key: 'p1', d: "m11 17 2 2a2 2 0 1 0 2.8-2.8l-6-6-2 2 2 2 2 2a2 2 0 1 1-2.8 2.8L11 17Z" }),
        React.createElement('path', { key: 'p2', d: "m22 11-2-2-6 6-2-2-6 6-2-2a2 2 0 0 1 2.8-2.8l6 6 2-2 6-6 2 2 2 2a2 2 0 0 1 2.8 2.8l-2 2Z" })
    ]),
    
    Phone: createSvgIcon(
        React.createElement('path', { d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" })
    ),
    
    Shield: createSvgIcon(
        React.createElement('path', { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" })
    ),
    
    TrendingUp: createSvgIcon([
        React.createElement('polyline', { key: 'p1', points: "22 7 13.5 15.5 8.5 10.5 2 17" }),
        React.createElement('polyline', { key: 'p2', points: "18 7 22 7 22 11" })
    ]),
    
    Terminal: createSvgIcon([
        React.createElement('polyline', { key: 'p1', points: "4 17 10 11 4 5" }),
        React.createElement('line', { key: 'line', x1: "12", y1: "19", x2: "20", y2: "19" })
    ]),
    
    Info: createSvgIcon([
        React.createElement('circle', { key: 'circle', cx: "12", cy: "12", r: "10" }),
        React.createElement('line', { key: 'l1', x1: "12", y1: "16", x2: "12", y2: "12" }),
        React.createElement('line', { key: 'l2', x1: "12", y1: "8", x2: "12.01", y2: "8" })
    ]),
    
    Clock: createSvgIcon([
        React.createElement('circle', { key: 'circle', cx: "12", cy: "12", r: "10" }),
        React.createElement('polyline', { key: 'polyline', points: "12 6 12 12 16 14" })
    ]),
    
    AlertTriangle: createSvgIcon([
        React.createElement('path', { key: 'path', d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }),
        React.createElement('line', { key: 'l1', x1: "12", y1: "9", x2: "12", y2: "13" }),
        React.createElement('line', { key: 'l2', x1: "12", y1: "17", x2: "12.01", y2: "17" })
    ]),
    
    AlertCircle: createSvgIcon([
        React.createElement('circle', { key: 'circle', cx: "12", cy: "12", r: "10" }),
        React.createElement('line', { key: 'l1', x1: "12", y1: "8", x2: "12", y2: "12" }),
        React.createElement('line', { key: 'l2', x1: "12", y1: "16", x2: "12.01", y2: "16" })
    ]),
    
    X: createSvgIcon([
        React.createElement('circle', { key: 'circle', cx: "12", cy: "12", r: "10" }),
        React.createElement('line', { key: 'l1', x1: "15", y1: "9", x2: "9", y2: "15" }),
        React.createElement('line', { key: 'l2', x1: "9", y1: "9", x2: "15", y2: "15" })
    ]),
};

// Export for global access
window.Icons = Icons;


