/**
 * Audio Module
 * Centralized audio effects with graceful degradation
 */

let sharedAudioContext = null;

function getAudioContext() {
  if (sharedAudioContext) return sharedAudioContext;
  if (typeof window === 'undefined') return null;

  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;

  sharedAudioContext = new AudioCtor();
  return sharedAudioContext;
}

/**
 * Create click sound using Web Audio API
 */
export function createClickSound() {
  const audioContext = getAudioContext();
  if (!audioContext) return () => {};

  return () => {
    try {
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
    } catch (error) {
      console.warn('Click sound failed:', error);
    }
  };
}

/**
 * Create success sound using Web Audio API
 */
export function createSuccessSound() {
  const audioContext = getAudioContext();
  if (!audioContext) return () => {};

  return () => {
    try {
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
    } catch (error) {
      console.warn('Success sound failed:', error);
    }
  };
}

/**
 * Create tension sound for slider interaction
 */
export function createTensionSound() {
  const audioContext = getAudioContext();
  if (!audioContext) {
    return {
      play: () => {},
      stop: () => {},
    };
  }

  let oscillator = null;
  let gainNode = null;
  let isPlaying = false;
  
  return {
    play(progress) {
      try {
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
      } catch (error) {
        console.warn('Tension sound failed:', error);
      }
    },
    
    stop() {
      try {
        if (isPlaying && oscillator) {
          oscillator.stop();
          oscillator = null;
          gainNode = null;
          isPlaying = false;
        }
      } catch (error) {
        console.warn('Stop tension sound failed:', error);
      }
    },
  };
}

/**
 * Create thunk sound for slider release
 */
export function createThunkSound() {
  const audioContext = getAudioContext();
  if (!audioContext) return () => {};

  return () => {
    try {
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
    } catch (error) {
      console.warn('Thunk sound failed:', error);
    }
  };
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
  const audioContext = getAudioContext();
  if (!audioContext) return () => {};

  return () => {
    try {
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
    } catch (error) {
      console.warn('Snap sound failed:', error);
    }
  };
}

