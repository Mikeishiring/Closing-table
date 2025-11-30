/**
 * Audio Module
 * Centralized audio effects with graceful degradation
 */

/**
 * Create click sound using Web Audio API
 */
export function createClickSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    return () => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1
      );
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    };
  } catch (error) {
    console.warn('Audio not supported:', error);
    return () => {}; // No-op fallback
  }
}

/**
 * Create success sound using Web Audio API
 */
export function createSuccessSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    return () => {
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator1.frequency.value = 523.25; // C5
      oscillator2.frequency.value = 659.25; // E5
      oscillator1.type = 'sine';
      oscillator2.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      );
      
      oscillator1.start(audioContext.currentTime);
      oscillator2.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + 0.3);
      oscillator2.stop(audioContext.currentTime + 0.3);
    };
  } catch (error) {
    console.warn('Audio not supported:', error);
    return () => {}; // No-op fallback
  }
}

/**
 * Create tension sound for slider interaction
 */
export function createTensionSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let oscillator = null;
    let gainNode = null;
    let isPlaying = false;
    
    return {
      play(progress) {
        if (!isPlaying) {
          oscillator = audioContext.createOscillator();
          gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.type = 'sine';
          gainNode.gain.value = 0.05;
          
          oscillator.start();
          isPlaying = true;
        }
        
        if (oscillator) {
          // Vary frequency based on slider progress (creates tension effect)
          const baseFreq = 200;
          const range = 400;
          oscillator.frequency.setValueAtTime(
            baseFreq + progress * range,
            audioContext.currentTime
          );
        }
      },
      
      stop() {
        if (isPlaying && oscillator) {
          oscillator.stop();
          oscillator = null;
          gainNode = null;
          isPlaying = false;
        }
      },
    };
  } catch (error) {
    console.warn('Audio not supported:', error);
    return {
      play: () => {},
      stop: () => {},
    };
  }
}

/**
 * Create thunk sound for slider release
 */
export function createThunkSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    return () => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 150;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.15
      );
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    };
  } catch (error) {
    console.warn('Audio not supported:', error);
    return () => {}; // No-op fallback
  }
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Haptics Module
 * Provides subtle tactile feedback on supported devices
 */
export const haptics = {
  /**
   * Check if vibration API is supported
   */
  isSupported() {
    return 'vibrate' in navigator;
  },

  /**
   * Trigger a haptic pulse for different feedback types
   * @param {'milestone' | 'snap' | 'success' | 'light'} type
   */
  pulse(type = 'light') {
    if (!this.isSupported() || prefersReducedMotion()) {
      return false;
    }

    const patterns = {
      // Short subtle bump for crossing snap points
      milestone: [8],
      // Very light tap when snapping to value
      snap: [4],
      // Satisfying confirmation
      success: [10, 50, 10],
      // Barely noticeable
      light: [3],
    };

    const pattern = patterns[type] || patterns.light;
    
    try {
      navigator.vibrate(pattern);
      return true;
    } catch (e) {
      console.warn('Haptic feedback failed:', e);
      return false;
    }
  },

  /**
   * Stop any ongoing vibration
   */
  cancel() {
    if (this.isSupported()) {
      navigator.vibrate(0);
    }
  },
};

/**
 * Create a subtle "bump" sound for snap points
 * Softer than click, just a tiny audio cue
 */
export function createSnapSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    return () => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Soft, muted pop sound
      oscillator.frequency.value = 280;
      oscillator.type = 'sine';
      
      // Very quiet - just a subtle cue
      gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.05
      );
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    };
  } catch (error) {
    console.warn('Audio not supported:', error);
    return () => {}; // No-op fallback
  }
}

