/**
 * Animation utilities optimized with requestAnimationFrame
 * Provides smooth, performant animations for visualization components
 */

/**
 * Animation frame manager for smooth animations
 */
class AnimationFrameManager {
  constructor() {
    this.animations = new Map();
    this.isRunning = false;
    this.frameId = null;
  }

  /**
   * Add an animation to the manager
   * @param {string} id - Unique identifier for the animation
   * @param {Function} callback - Animation callback function
   * @param {Object} options - Animation options
   */
  addAnimation(id, callback, options = {}) {
    const animation = {
      id,
      callback,
      startTime: performance.now(),
      duration: options.duration || 1000,
      easing: options.easing || 'easeInOut',
      loop: options.loop || false,
      onComplete: options.onComplete,
      paused: false,
      progress: 0
    };

    this.animations.set(id, animation);
    
    if (!this.isRunning) {
      this.start();
    }

    return animation;
  }

  /**
   * Remove an animation from the manager
   * @param {string} id - Animation identifier
   */
  removeAnimation(id) {
    const animation = this.animations.get(id);
    if (animation && animation.onComplete) {
      animation.onComplete();
    }
    
    this.animations.delete(id);
    
    if (this.animations.size === 0) {
      this.stop();
    }
  }

  /**
   * Pause an animation
   * @param {string} id - Animation identifier
   */
  pauseAnimation(id) {
    const animation = this.animations.get(id);
    if (animation) {
      animation.paused = true;
    }
  }

  /**
   * Resume an animation
   * @param {string} id - Animation identifier
   */
  resumeAnimation(id) {
    const animation = this.animations.get(id);
    if (animation) {
      animation.paused = false;
      animation.startTime = performance.now() - (animation.progress * animation.duration);
    }
  }

  /**
   * Start the animation loop
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.tick();
  }

  /**
   * Stop the animation loop
   */
  stop() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    this.isRunning = false;
  }

  /**
   * Animation loop tick
   */
  tick = () => {
    const currentTime = performance.now();
    
    for (const [id, animation] of this.animations) {
      if (animation.paused) continue;
      
      const elapsed = currentTime - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1);
      
      animation.progress = progress;
      
      // Apply easing function
      const easedProgress = this.applyEasing(progress, animation.easing);
      
      // Call animation callback
      try {
        animation.callback(easedProgress, progress, elapsed);
      } catch (error) {
        console.error(`Animation ${id} error:`, error);
        this.removeAnimation(id);
        continue;
      }
      
      // Check if animation is complete
      if (progress >= 1) {
        if (animation.loop) {
          animation.startTime = currentTime;
          animation.progress = 0;
        } else {
          this.removeAnimation(id);
        }
      }
    }
    
    if (this.isRunning && this.animations.size > 0) {
      this.frameId = requestAnimationFrame(this.tick);
    } else {
      this.stop();
    }
  };

  /**
   * Apply easing function to progress
   * @param {number} t - Progress (0-1)
   * @param {string} easing - Easing function name
   * @returns {number} Eased progress
   */
  applyEasing(t, easing) {
    switch (easing) {
      case 'linear':
        return t;
      case 'easeIn':
        return t * t;
      case 'easeOut':
        return t * (2 - t);
      case 'easeInOut':
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      case 'easeInCubic':
        return t * t * t;
      case 'easeOutCubic':
        return (--t) * t * t + 1;
      case 'easeInOutCubic':
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      case 'bounce':
        if (t < 1 / 2.75) {
          return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
          return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
          return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
          return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
      default:
        return t;
    }
  }

  /**
   * Clear all animations
   */
  clear() {
    this.animations.clear();
    this.stop();
  }
}

// Global animation manager instance
const globalAnimationManager = new AnimationFrameManager();

/**
 * Hook for using animations in React components
 * @param {string} id - Unique animation identifier
 * @returns {Object} Animation controls
 */
export function useAnimation(id) {
  const startAnimation = (callback, options = {}) => {
    return globalAnimationManager.addAnimation(id, callback, options);
  };

  const stopAnimation = () => {
    globalAnimationManager.removeAnimation(id);
  };

  const pauseAnimation = () => {
    globalAnimationManager.pauseAnimation(id);
  };

  const resumeAnimation = () => {
    globalAnimationManager.resumeAnimation(id);
  };

  return {
    startAnimation,
    stopAnimation,
    pauseAnimation,
    resumeAnimation
  };
}

/**
 * Utility function for smooth value interpolation
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} progress - Progress (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(start, end, progress) {
  return start + (end - start) * progress;
}

/**
 * Utility function for smooth color interpolation
 * @param {string} startColor - Start color (hex)
 * @param {string} endColor - End color (hex)
 * @param {number} progress - Progress (0-1)
 * @returns {string} Interpolated color (hex)
 */
export function lerpColor(startColor, endColor, progress) {
  const start = hexToRgb(startColor);
  const end = hexToRgb(endColor);
  
  if (!start || !end) return startColor;
  
  const r = Math.round(lerp(start.r, end.r, progress));
  const g = Math.round(lerp(start.g, end.g, progress));
  const b = Math.round(lerp(start.b, end.b, progress));
  
  return rgbToHex(r, g, b);
}

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color
 * @returns {Object|null} RGB object or null if invalid
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB to hex color
 * @param {number} r - Red component
 * @param {number} g - Green component
 * @param {number} b - Blue component
 * @returns {string} Hex color
 */
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Debounced animation trigger to prevent excessive animations
 * @param {Function} callback - Animation callback
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounceAnimation(callback, delay = 100) {
  let timeoutId;
  
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  };
}

/**
 * Throttled animation trigger to limit animation frequency
 * @param {Function} callback - Animation callback
 * @param {number} limit - Throttle limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttleAnimation(callback, limit = 16) { // ~60fps
  let inThrottle;
  
  return (...args) => {
    if (!inThrottle) {
      callback(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Animation sequence manager for chaining animations
 */
export class AnimationSequence {
  constructor() {
    this.sequence = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.onComplete = null;
  }

  /**
   * Add animation to sequence
   * @param {Function} callback - Animation callback
   * @param {Object} options - Animation options
   * @returns {AnimationSequence} This instance for chaining
   */
  add(callback, options = {}) {
    this.sequence.push({ callback, options });
    return this;
  }

  /**
   * Add delay to sequence
   * @param {number} duration - Delay duration in milliseconds
   * @returns {AnimationSequence} This instance for chaining
   */
  delay(duration) {
    this.sequence.push({ 
      callback: () => {}, 
      options: { duration, isDelay: true } 
    });
    return this;
  }

  /**
   * Play the animation sequence
   * @param {Function} onComplete - Callback when sequence completes
   */
  play(onComplete) {
    if (this.isPlaying) return;
    
    this.onComplete = onComplete;
    this.currentIndex = 0;
    this.isPlaying = true;
    this.playNext();
  }

  /**
   * Stop the animation sequence
   */
  stop() {
    this.isPlaying = false;
    globalAnimationManager.removeAnimation(`sequence-${this.id}`);
  }

  /**
   * Play next animation in sequence
   */
  playNext() {
    if (!this.isPlaying || this.currentIndex >= this.sequence.length) {
      this.isPlaying = false;
      if (this.onComplete) {
        this.onComplete();
      }
      return;
    }

    const { callback, options } = this.sequence[this.currentIndex];
    const animationId = `sequence-${this.id}-${this.currentIndex}`;

    globalAnimationManager.addAnimation(
      animationId,
      callback,
      {
        ...options,
        onComplete: () => {
          this.currentIndex++;
          this.playNext();
        }
      }
    );
  }
}

/**
 * Performance monitoring for animations
 */
export class AnimationPerformanceMonitor {
  constructor() {
    this.metrics = {
      frameCount: 0,
      droppedFrames: 0,
      averageFPS: 0,
      lastFrameTime: performance.now()
    };
    this.isMonitoring = false;
  }

  /**
   * Start performance monitoring
   */
  start() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.metrics.frameCount = 0;
    this.metrics.droppedFrames = 0;
    this.metrics.lastFrameTime = performance.now();
    this.monitor();
  }

  /**
   * Stop performance monitoring
   */
  stop() {
    this.isMonitoring = false;
  }

  /**
   * Monitor animation performance
   */
  monitor = () => {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.metrics.lastFrameTime;
    
    this.metrics.frameCount++;
    
    // Check for dropped frames (assuming 60fps target)
    if (deltaTime > 16.67 * 2) { // More than 2 frames
      this.metrics.droppedFrames++;
    }
    
    // Calculate average FPS
    this.metrics.averageFPS = 1000 / deltaTime;
    this.metrics.lastFrameTime = currentTime;
    
    requestAnimationFrame(this.monitor);
  };

  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }
}

// Export global instances
export { globalAnimationManager };
export default {
  useAnimation,
  lerp,
  lerpColor,
  debounceAnimation,
  throttleAnimation,
  AnimationSequence,
  AnimationPerformanceMonitor,
  globalAnimationManager
};