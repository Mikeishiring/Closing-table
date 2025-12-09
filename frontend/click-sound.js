// Generate a satisfying "click-lock" sound effect
export const createClickSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const playClickSound = () => {
        const now = audioContext.currentTime;
        
        // Create oscillators for a satisfying "click-lock" sound
        const osc1 = audioContext.createOscillator();
        const osc2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Connect nodes
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configure first oscillator (the "click")
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(800, now);
        osc1.frequency.exponentialRampToValueAtTime(200, now + 0.05);
        
        // Configure second oscillator (the "lock")
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(400, now + 0.05);
        osc2.frequency.exponentialRampToValueAtTime(100, now + 0.15);
        
        // Envelope
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        // Start and stop
        osc1.start(now);
        osc1.stop(now + 0.1);
        osc2.start(now + 0.05);
        osc2.stop(now + 0.2);
    };
    
    return playClickSound;
};

// Generate a satisfying "success" sound
export const createSuccessSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const playSuccessSound = () => {
        const now = audioContext.currentTime;
        
        // Create a pleasant ascending tone
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configure oscillator
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
        
        // Envelope
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
        gainNode.gain.linearRampToValueAtTime(0.15, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        
        // Start and stop
        osc.start(now);
        osc.stop(now + 0.4);
    };
    
    return playSuccessSound;
};




