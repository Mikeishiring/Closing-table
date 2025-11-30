/**
 * Audio Manager Module
 * Consolidated audio functionality - replaces 12 separate functions
 */

const AudioManager = (() => {
    let audioContext = null;
    let tensionOscillator = null;
    let tensionGain = null;
    
    // Initialize audio context
    const init = () => {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioContext;
    };
    
    // Check if sound is enabled
    const isSoundEnabled = () => {
        const stored = localStorage.getItem('closing-table-sound-enabled');
        return stored === null ? true : stored === 'true';
    };
    
    // Set sound enabled state
    const setSoundEnabled = (enabled) => {
        localStorage.setItem('closing-table-sound-enabled', enabled.toString());
    };
    
    /**
     * Create a tone with ADSR envelope
     * @param {number} frequency - Frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {string} type - Oscillator type: 'sine', 'square', 'triangle', 'sawtooth'
     * @param {Object} envelope - ADSR envelope settings
     */
    const createTone = (frequency, duration, type = 'sine', envelope = {}) => {
        if (!isSoundEnabled()) return null;
        
        const ctx = init();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = type;
        osc.frequency.value = frequency;
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        const now = ctx.currentTime;
        const { 
            attack = 0.01, 
            sustain = 0.3, 
            release = duration * 0.3 
        } = envelope;
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(sustain, now + attack);
        gain.gain.linearRampToValueAtTime(0, now + duration);
        
        osc.start(now);
        osc.stop(now + duration);
        
        return { osc, gain };
    };
    
    /**
     * Play tension sound while dragging slider
     * @param {number} progress - 0 to 1 progress value
     */
    const playTension = (progress) => {
        if (!isSoundEnabled()) return;
        
        const ctx = init();
        
        if (!tensionOscillator) {
            tensionOscillator = ctx.createOscillator();
            tensionGain = ctx.createGain();
            
            tensionOscillator.type = 'sine';
            tensionOscillator.connect(tensionGain);
            tensionGain.connect(ctx.destination);
            tensionGain.gain.value = 0;
            tensionOscillator.start();
        }
        
        // Frequency rises with progress
        const baseFreq = 200;
        const maxFreq = 600;
        tensionOscillator.frequency.value = baseFreq + (maxFreq - baseFreq) * progress;
        tensionGain.gain.value = 0.05;
    };
    
    /**
     * Stop tension sound
     */
    const stopTension = () => {
        if (tensionGain) {
            tensionGain.gain.value = 0;
        }
    };
    
    /**
     * Play thunk sound when releasing slider
     */
    const playThunk = () => {
        createTone(80, 0.15, 'sine', { attack: 0.01, sustain: 0.3 });
    };
    
    /**
     * Play magnetic latch sound for lock actions
     */
    const playMagneticLatch = () => {
        if (!isSoundEnabled()) return;
        
        const ctx = init();
        const now = ctx.currentTime;
        
        // Main latch tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        osc.start(now);
        osc.stop(now + 0.3);
    };
    
    /**
     * Play cash drop sound for success celebrations
     */
    const playCashDrop = () => {
        if (!isSoundEnabled()) return;
        
        const ctx = init();
        const now = ctx.currentTime;
        
        // Coin sound
        const coinOsc = ctx.createOscillator();
        const coinGain = ctx.createGain();
        
        coinOsc.type = 'sine';
        coinOsc.frequency.setValueAtTime(2000, now);
        coinOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        
        coinOsc.connect(coinGain);
        coinGain.connect(ctx.destination);
        
        coinGain.gain.setValueAtTime(0.2, now);
        coinGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        coinOsc.start(now);
        coinOsc.stop(now + 0.15);
        
        // Paper rustle
        setTimeout(() => {
            const rustleOsc = ctx.createOscillator();
            const rustleGain = ctx.createGain();
            
            rustleOsc.type = 'sawtooth';
            rustleOsc.frequency.value = 100;
            
            rustleOsc.connect(rustleGain);
            rustleGain.connect(ctx.destination);
            
            rustleGain.gain.setValueAtTime(0.05, ctx.currentTime);
            rustleGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            
            rustleOsc.start();
            rustleOsc.stop(ctx.currentTime + 0.1);
        }, 50);
    };
    
    /**
     * Play click sound for button interactions
     */
    const playClick = () => {
        if (!isSoundEnabled()) return;
        
        const ctx = init();
        const now = ctx.currentTime;
        
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.value = 1000;
        osc2.type = 'sine';
        osc2.frequency.value = 1500;
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.08);
        osc2.stop(now + 0.08);
    };
    
    /**
     * Play success sound (ascending arpeggio)
     */
    const playSuccess = () => {
        if (!isSoundEnabled()) return;
        
        const ctx = init();
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.type = 'sine';
                osc.frequency.value = freq;
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                
                osc.start(now);
                osc.stop(now + 0.3);
            }, i * 100);
        });
    };
    
    /**
     * Trigger haptic feedback if available
     */
    const triggerHaptic = () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    };
    
    // Public API
    return {
        init,
        isSoundEnabled,
        setSoundEnabled,
        playTension,
        stopTension,
        playThunk,
        playMagneticLatch,
        playCashDrop,
        playClick,
        playSuccess,
        triggerHaptic,
    };
})();

// Export for global access
window.AudioManager = AudioManager;

